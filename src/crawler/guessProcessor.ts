import { ProcessorConfigName, ProcessorName } from "./singleton";

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

export const guessProcessor = (hint: string): ProcessorName | undefined => {
  const sentence = hint.toLowerCase();
  const target = translateList.find((words) =>
    words.some((word) => sentence.includes(word.toLowerCase()))
  )?.[0];

  return target ? `${target}Processor` : undefined;
};
