import fetch from "node-fetch";
import { singleton, singletonGuess } from "../crawler/singleton";
import { log } from "../common/log";

export const dingTalkTask = async (webhooks: string | string[]) => {
  const hooks = [webhooks].flat();
  if (!hooks.length) return;

  const body = JSON.stringify({
    msgtype: "markdown",
    markdown: {
      title: "The BIG BANG FE 🔥 今日读物",
      text: await singleton(),
    },
  });

  hooks.forEach(async (hook) => {
    log("webhook 触发 --> " + hook);

    try {
      const response = await (
        await fetch(hook, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body,
        })
      ).json();

      log(`webhook ${hook} 请求成功 ${JSON.stringify(response)}`);
    } catch (e) {
      log(`webhook ${hook} 请求错误 ${e.toString()}`, "error");
    }
  });
};

export const dingTalkAsk = async (hint: string, webhooks: string) => {
  const hooks = [webhooks].flat();
  if (!hooks.length) return;

  const body = JSON.stringify({
    msgtype: "markdown",
    markdown: {
      title: "The BIG BANG FE 🔥 读物检索",
      text: await singletonGuess(hint),
    },
  });

  console.log({
    body
  })

  hooks.forEach(async (hook) => {
    log("webhook 触发 --> " + hook);

    try {
      const response = await (
        await fetch(hook, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body,
        })
      ).json();

      log(`webhook ${hook} 请求成功 ${JSON.stringify(response)}`);
    } catch (e) {
      log(`webhook ${hook} 请求错误 ${e.toString()}`, "error");
    }
  });
};
