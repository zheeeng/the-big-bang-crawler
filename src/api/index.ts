import { Response, Router } from "farrow-http";
import { Nullable } from "farrow-schema";
import { singleton } from "../crawler/singleton";
import { CRAWLER_ACCESS_TOKEN, CRAWLER_DINGTALK_WEBHOOKS } from "../config/env";
import { dingTalkTask, dingTalkAsk } from "../tasks/dingtalkBot";
import { guessProcessor } from "../crawler/guessProcessor";
import { log } from "../common/log";

export const services = Router();

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

services
  .match({
    pathname: "/dingtalk-bot/fe-daily",
    query: {
      accessToken: String,
      answerHook: Nullable(String),
    },
  })
  .use(async (request) => {
    if (request.query.accessToken !== CRAWLER_ACCESS_TOKEN)
      return Response.status(401, "Invalid accessToken");
    dingTalkTask(request.query.answerHook ?? CRAWLER_DINGTALK_WEBHOOKS);

    return Response.json({
      message: "机器人任务已发布",
    });
  });

services
  .match({
    pathname: "/ask-bot/fe-daily",
    body: {
      accessToken: String,
      answerHook: String,
      "sys.userInput": String,
    },
    method: "POST",
  })
  .use(async (request) => {
    if (request.body.accessToken !== CRAWLER_ACCESS_TOKEN)
      return Response.status(401, "Invalid accessToken");

    const hint = request.body["sys.userInput"];
    const processorName = guessProcessor(hint);

    log(`guess ${processorName} from ${hint}`);

    if (!processorName)
      return Response.json({
        errorCode: 200,
        errorMsg: "没找到相关资料",
        success: true,
        fields: {
          message: "没找到相关资料",
        },
      });

    dingTalkAsk(processorName, request.body.answerHook);

    return Response.json({
      errorCode: 200,
      errorMsg: "查找中...",
      success: true,
      fields: {
        message: "查找中...",
      },
    });
  });
