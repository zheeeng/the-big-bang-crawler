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
    },
  })
  .use(async (request) => {
    if (request.query.accessToken !== CRAWLER_ACCESS_TOKEN)
      return Response.status(401, "Invalid accessToken");

    return Response.text(await singleton());
  });
