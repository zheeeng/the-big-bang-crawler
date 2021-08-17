import * as processors from "./processors";
import { nonNull } from "./utils";
import fetch from "node-fetch";
import { log } from "../common/log";
import { CRAWLER_TIME_SPAN_HOURS, CRAWLER_BAN_TOPICS } from "../config/env";

type ResultEntry = [
  processorName: string,
  content: null | {
    all: [frontMatter: string, entries: string[]];
    partial: [frontMatter: string, entries: string[]];
  },
  time: null | number
];

type ProcessorName = keyof typeof processors;
type GetProcessorConfigName<T extends ProcessorName> =
  T extends `${infer I}Processor` ? I : never;
type ProcessorConfigName = GetProcessorConfigName<ProcessorName>;

const cacheLifeSpan = 1000 * 3600 * CRAWLER_TIME_SPAN_HOURS;

const processorNames = Object.keys(processors) as ProcessorName[];
let resultEntries: Array<ResultEntry> = processorNames
  .filter(([processorName]) =>
    (CRAWLER_BAN_TOPICS as ProcessorConfigName[]).every(
      (topic) => topic + "Processor" !== processorName
    )
  )
  .map((processorName) => [processorName, null, null]);

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

const updateResultByProcessName = async (queryProcessorName: ProcessorName) => {
  const now = new Date().getTime();

  log("开始获取" + queryProcessorName);

  try {
    resultEntries = await Promise.all(
      resultEntries.map(async ([processorName, content, time]) => {
        if (
          processorName === queryProcessorName &&
          (!time || !content || now > time + cacheLifeSpan)
        ) {
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
      ([outputTotal, outputContent], content) => {
        if (!content.partial[1].length) return [outputTotal, outputContent];
        return [
          outputTotal + content.partial[1].length,
          [
            outputContent + content.partial[0],
            content.partial[1].join("\n\n"),
            "---",
          ]
            .flat()
            .join("\n\n"),
        ];
      },
      [0, ""]
    );

  const { quote, quoteAuthor, today, greetingImage } = await getTodayInfo();

  return [
    `# the BIG BANG FE 🔥 今日读物`,
    `**时间：** *${today}* | **总数：** *${total} 条*`,
    `![Hello](${greetingImage})`,
    quote && quoteAuthor ? `> ${quote} *-- ${quoteAuthor}*` : "",
    "---",
    content,
  ].join("\n\n");
};

const messageByProcessorName = async (queryProcessorName: ProcessorName) => {
  const content = resultEntries.find(
    ([processorName]) => processorName === queryProcessorName
  )?.[1];

  if (!content) return "无内容更新";

  return content.all.flat().join("\n--\n");
};

export const singleton = async () => {
  await updateResult();

  return await message();
};

const translateList: Array<[key: ProcessorConfigName, ...fussKeys: string[]]> =
  [
    ["ruanYifengBlog", "ruanyifeng", "阮一峰"],
    ["aliMaMaFe", "alimama", "快爆", "阿里妈妈"],
    ["juejinHot", "juejin", "掘金", "掘金热门", "掘金前端"],
    ["infoQFE", "infoQ", "infoQ前端", "前端之巅", "阅读", "reading"],
    ["githubFrontEndTopic", "topic", "前端专题", "前端话题"],
    [
      "githubTrending",
      "github",
      "trending",
      "前端流行",
      "前端潮流",
      "前端趋势",
    ],
  ];

export const singletonGuess = async (hint: string) => {
  const sentence = hint.toLowerCase();
  const target = translateList.find((words) =>
    words.some((word) => sentence.includes(word))
  )?.[0];

  log(`guess ${target} from ${hint}`)

  if (!target) return "";

  const processorName = (target + "Processor") as ProcessorName;

  await updateResultByProcessName(processorName);

  return messageByProcessorName(processorName);
};
