import { log } from "../common/log";
import { CRAWLER_RUANYIFENG_TOPICS, CRAWLER_TIME_SPAN_HOURS } from "../config/env";
import { RuanYifengContent } from "./type";
import {
  githubFrontEndTopicWorker,
  githubTrendingWorker,
  infoQFEWorker,
  juejinFEHotWorker,
  ruanYifengBlogWorker,
  ruanYifengAllBlogWorker,
} from "./workers";

const filterTimeSpan = 1000 * 3600 * CRAWLER_TIME_SPAN_HOURS;

type ProcessorResult = [total: number, mdContent: string];

export const ruanYifengBlogProcessor = async (): Promise<ProcessorResult> => {
  try {
    const latestArticles = await ruanYifengAllBlogWorker();

    log(`阮一峰博客最新 ${latestArticles.length} 条`);

    const allForReference = latestArticles.reduce<
      Record<string, RuanYifengContent>
    >((rec, article) => {
      rec[article.link] = article;
      return rec;
    }, {});

    const topics = await Promise.all(
      CRAWLER_RUANYIFENG_TOPICS.map(topic => ruanYifengBlogWorker(topic, allForReference))
    );
    const totalArticles = topics.flatMap(topic => topic);

    log(`阮一峰博客 ${totalArticles.length} 条`);

    topics.forEach((topic, index) => {
      if (CRAWLER_RUANYIFENG_TOPICS[index]) {
        log(`阮一峰博客 ${CRAWLER_RUANYIFENG_TOPICS[index]} 专题 ${topic.length} 条`);
      }
    })

    const content = [
      `## 阮一峰技术博客 *Ruan Yifeng's Personal Website*`,
      ...totalArticles.map((article) => [
        `### [${article.title}](${article.link})`,
        `评论数：${article.commentCount}`,
      ]),
    ]
      .flatMap((i) => i)
      .join("\n\n");

    return [totalArticles.length, content];
  } catch (error) {
    log(`阮一峰博客 请求错误 ${error.toString()}`, "error");
    return [0, ""];
  }
};

export const githubFrontEndTopicProcessor =
  async (): Promise<ProcessorResult> => {
    try {
      const articles = await githubFrontEndTopicWorker();

      log(`Github 前端专题榜 ${articles.length} 条`);

      const content = [
        `## Github 前端专题榜`,
        ...articles.map((article) => [
          `### [${article.title}](${article.link})`,
          `    ${article.content}`,
          `语言：${article.language} ｜ ⭐️：${article.stars}`,
        ]),
      ]
        .flatMap((i) => i)
        .join("\n\n");

      return [articles.length, content];
    } catch (error) {
      log(`Github 前端专题榜请求错误 ${error.toString()}`, "error");
      return [0, ""];
    }
  };

export const githubTrendingProcessor = async (): Promise<ProcessorResult> => {
  try {
    const [githubTrendingTS, githubTrendingJS] = await Promise.all([
      githubTrendingWorker("Typescript"),
      githubTrendingWorker("Javascript"),
    ]);

    log(`Github 趋势榜（Typescript）${githubTrendingTS.length} 条`);
    log(`Github 趋势榜（Javascript）${githubTrendingJS.length} 条`);

    const githubTrending = [...githubTrendingTS, ...githubTrendingJS];

    const content = [
      `## Github TS/JS 流行趋势`,
      ...githubTrending.map((article) => [
        `### [${article.title}](${article.link})`,
        `    ${article.content}`,
        `语言：${article.language} ｜ fork：${article.forks} | ⭐️：${article.stars} | 今日 ⭐️：${article.todayStars} `,
      ]),
    ]
      .flatMap((i) => i)
      .join("\n\n");

    return [githubTrending.length, content];
  } catch (error) {
    log(`Github 趋势榜请求错误 ${error.toString()}`, "error");
    return [0, ""];
  }
};

export const juejinHotProcessor = async (): Promise<ProcessorResult> => {
  try {
    const articles = await juejinFEHotWorker();

    const now = new Date().getTime();

    const latestArticles = articles.filter(
      (article) => article.cTime + filterTimeSpan > now
    );

    log(`掘金前端热帖结果 ${latestArticles.length}/${articles.length} 条`);

    const content = [
      `## 掘金 24 小时内最新前端热贴`,
      ...latestArticles.map((article) => [
        `### [${article.title}](${article.link})`,
        `    ${article.content}`,
        `作者：${article.authorName} ｜ 评论数：${article.commentCount} | 浏览数：${article.viewCount} | 🧡：${article.diggCount}`,
      ]),
    ]
      .flatMap((i) => i)
      .join("\n\n");

    return [latestArticles.length, content];
  } catch (error) {
    log(`掘金前端热帖请求错误 ${error.toString()}`, "error");
    return [0, ""];
  }
};

export const infoQFEProcessor = async (): Promise<ProcessorResult> => {
  try {
    const articles = await infoQFEWorker();

    const now = new Date().getTime();

    const latestArticles = articles.filter(
      (article) => article.cTime + filterTimeSpan > now
    );

    log(`InfoQ 前端之巅结果 ${latestArticles.length}/${articles.length} 条`);

    const content = [
      `## InfoQ 前端之巅 24 小时内最新前端热贴`,
      ...latestArticles.map((article) => [
        `### [${article.title}](${article.link})`,
        `    ${article.content}`,
        `作者：${article.authors}`,
      ]),
    ]
      .flatMap((i) => i)
      .join("\n\n");

    return [latestArticles.length, content];
  } catch (error) {
    log(`InfoQ 前端之巅请求错误 ${error.toString()}`, "error");

    return [0, ""];
  }
};
