import { stringify } from "flatted";

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  res.status(200).json(stringify(req));

  const slackResponse = {
    blocks: [
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              {
                type: "text",
                text: "I",
              },
              {
                type: "text",
                text: " was assigned today's shift!",
                style: {
                  italic: true,
                },
              },
            ],
          },
        ],
      },
    ],
  };

  // fetch(req.body.response_url, { method: "POST", body: JSON.stringify(slackResponse) });
}
