import { Response, Router } from "farrow-http";
import { Nullable } from "farrow-schema";
import { singleton } from "../crawler/singleton";
import { CRAWLER_ACCESS_TOKEN } from "../config/env";
import { dingTalkTask } from "../tasks/dingtalkBot";

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

// attach todo api
services
  .match({
    pathname: "/dingtalk-bot/fe-daily",
    query: {
      accessToken: String,
      format: Nullable(String),
    },
  })
  .use(async (request) => {
    if (request.query.accessToken !== CRAWLER_ACCESS_TOKEN)
      return Response.status(401, "Invalid accessToken");
    dingTalkTask()

    return Response.json({
      message: '机器人任务已发布'
    })
  });
