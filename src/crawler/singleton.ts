import * as processors from "./processors";
import { nonNull } from "./utils";
import fetch from "node-fetch";
import { log } from "../common/log";
import { CRAWLER_TIME_SPAN_HOURS } from "../config/env";

type ResultEntry = [
  processorName: string,
  content: null | [total: number, content: string],
  time: null | number
];

const cacheLifeSpan = 1000 * 3600 * CRAWLER_TIME_SPAN_HOURS;

let resultEntries: Array<ResultEntry> = Object.keys(processors).map(
  (processorName) => [processorName, null, null]
);

const updateResult = async () => {
  const now = new Date().getTime();

  log("开始获取" + resultEntries.map((entry) => entry[0]));

  try {
    resultEntries = await Promise.all(
      resultEntries.map(async ([processorName, content, time]) => {
        if (!time || !content || now > time + cacheLifeSpan) {
          log(`get ${processorName} from remote`);

          return [
            processorName,
            await processors[processorName as keyof typeof processors](),
            now,
          ] as ResultEntry;
        } else {
          log(`get ${processorName} from local cache`);
        }

        return [processorName, content, time] as ResultEntry;
      })
    );
  } catch (e) {
    log("updateResult 错误" + e.toString(), "error");
  }
};

let todayInfo: {
  date: Date | null;
  seed: string;
  quote: string;
  author: string;
} = {
  date: null,
  seed: "",
  quote: "",
  author: "",
};

const getTodayInfo = async () => {
  const now = new Date();

  if (
    !todayInfo.date ||
    now.getTime() > todayInfo.date.getTime() + cacheLifeSpan
  ) {
    log("get todayInfo request from remote");

    todayInfo.date = now;
    todayInfo.seed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    Object.assign(
      todayInfo,
      await (async () => {
        try {
          const res: {
            contents: { quotes: [{ author: string; quote: string }] };
          } = await (await fetch("https://quotes.rest/qod")).json();

          log("todayInfo:" + JSON.stringify(res, null, 4));

          const { author, quote } = res.contents.quotes[0];

          return {
            quote,
            author,
          };
        } catch (err) {
          log("todayInfo 请求错误:" + err.toString(), "error");

          return {
            quote: "",
            author: "",
          };
        }
      })()
    );
  } else {
    log("get todayInfo request from local cache");
  }

  return {
    today: todayInfo.date.toLocaleTimeString("zh-CN", {
      timeZone: "Asia/Shanghai",
    }),
    quote: todayInfo.quote,
    quoteAuthor: todayInfo.author,
    greetingImage: `https://picsum.photos/seed/${todayInfo.seed}/200/300`,
  };
};

const message = async () => {
  const [total, content] = resultEntries
    .map((entry) => entry[1])
    .filter(nonNull)
    .reduce<[total: number, content: string]>(
      ([outputTotal, outputContent], [total, content]) => {
        if (!total || !content) return [outputTotal, outputContent];
        return [outputTotal + total, outputContent + content + "\n\n---\n\n"];
      },
      [0, ""]
    );

  const { quote, quoteAuthor, today, greetingImage } = await getTodayInfo();

  const output = [
    `# the BIG BANG FE 🔥 今日读物`,
    `**时间：***${today}*`,
    `**总数：***${total} 条*`,
    `![Hello](${greetingImage})`,
    `> ${quote} *-- ${quoteAuthor}*`,
    '---',
    content,
  ].join("\n\n");
  return output;
};

export const singleton = async () => {
  await updateResult();

  return await message();
};
