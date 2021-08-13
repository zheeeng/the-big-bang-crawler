import { Response, Router } from "farrow-http";
import { Nullable } from "farrow-schema";
import { singleton } from "../crawler/singleton";
import { CRAWLER_ACCESS_TOKEN } from "../config/env";

export const services = Router();

// attach todo api
services
  .match({
    pathname: "/api/fe-daily",
    query: {
      accessToken: String,
      format: Nullable(String),
    },
  })
  .use(async (request) => {
    if (request.query.accessToken !== CRAWLER_ACCESS_TOKEN)
      return Response.status(401, "Invalid accessToken");

    if (request.query.format === "dingTalk")
      return Response.json({
        success: true,
        errorCode: 200,
        errorMsg: "",
        fields: {
          "msgType": "markdown",
          "title": "乔布斯",
          "text": await singleton(),
          "atDingtalkIds": "对应的钉钉用户钉钉号",
          "isAtAll": false
        },
      });

    return Response.text(await singleton());
  });
