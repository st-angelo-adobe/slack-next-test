const heroesDb = JSON.parse(`[
    {
      "_path": "/content/dam/sandbox/hero-of-the-day/bartholomew",
      "userEmail": "wel77622@adobe.com",
      "slackId": "WGV9E0L1H",
      "timeZone": "PST",
      "shiftStart": null
    },
    {
      "_path": "/content/dam/sandbox/hero-of-the-day/behera",
      "userEmail": "behera@adobe.com",
      "slackId": "W4KPL0ZC7",
      "timeZone": "IST",
      "shiftStart": null
    },
    {
      "_path": "/content/dam/sandbox/hero-of-the-day/vkniaziev",
      "userEmail": "vkniaziev@adobe.com",
      "slackId": "U05011LLE6M",
      "timeZone": "PST",
      "shiftStart": "2024-10-16"
    },
    {
      "_path": "/content/dam/sandbox/hero-of-the-day/vlassenko-adobe-com",
      "userEmail": "vlassenko@adobe.com",
      "slackId": "U03E672Q1NE",
      "timeZone": "CET",
      "shiftStart": "2024-10-17"
    }
  ]`);

const supportedTimezones = ["PST", "CET", "IST"];

function parseAll(text) {
  if (!text) return false;

  const valueToBoolean = (value) => {
    if (value === "all" || value === "1" || value === "true") return true;
    return false;
  };

  const fragments = text.split("=");
  if (fragments.length === 1) return valueToBoolean(fragments[0]);
  if (fragments.length === 2) return valueToBoolean(fragments[1]);
}

function getHeroesSlackList(heroes, indent = 0) {
  const items = heroes.map((hero) => ({
    type: "rich_text_section",
    elements: [
      {
        type: "user",
        user_id: hero.slackId,
      },
      {
        type: "text",
        text: ` (Slack id: ${hero.slackId})`,
      },
    ],
  }));

  return {
    type: "rich_text_list",
    elements: items,
    style: "bullet",
    indent,
  };
}

/**
 *
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const all = parseAll(req.body.text);

  let aggregatedHeroes = {};

  if (all) {
    aggregatedHeroes = heroesDb.reduce((acc, item) => {
      if (!acc[item.timeZone]) {
        acc[item.timeZone] = [];
      }
      acc[item.timeZone].push(item);
      return acc;
    }, {});
  } else {
    aggregatedHeroes.PST = heroesDb.filter((hero) => hero.timeZone === "PST");
  }

  const title = all ? "All heroes, by time zone:" : "Currently available heroes (PST time zone):";

  const elements = [
    {
      type: "rich_text_section",
      elements: [
        {
          type: "text",
          text: title,
        },
      ],
    },
  ];

  if (all) {
    Object.keys(aggregatedHeroes).forEach((key) => {
      elements.push({
        type: "rich_text_list",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              {
                type: "text",
                text: `${key}:`,
              },
            ],
          },
        ],
        style: "bullet",
      });
      elements.push(getHeroesSlackList(aggregatedHeroes[key], 1));
    });
  } else {
    elements.push(getHeroesSlackList(aggregatedHeroes["PST"]));
  }

  const slackMessage = {
    blocks: [
      {
        type: "rich_text",
        elements,
      },
    ],
  };

  res.status(200).end();

  fetch(req.body.response_url, {
    method: "POST",
    body: JSON.stringify(slackMessage),
  });
}
