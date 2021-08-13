import { Response, Router } from "farrow-http";
import { singleton } from "../crawler/singleton";
import { CRAWLER_ACCESS_TOKEN } from "../config/env";

export const services = Router();

// attach todo api
services
  .match({
    pathname: "/api/fe-daily",
    query: {
      accessToken: String,
      format: String
    },
  })
  .use(async (request) => {
    if (request.query.accessToken !== CRAWLER_ACCESS_TOKEN)
      return Response.status(401, "Invalid accessToken");

    if (request.query.format === 'md') return Response.text(await singleton());

    return Response.json({ markdown: await singleton() })
  });
