import { log } from "../common/log";
import {
  CRAWLER_RUANYIFENG_TOPICS,
  CRAWLER_TIME_SPAN_HOURS,
  CRAWLER_TOP_COUNT,
} from "../config/env";
import { RuanYifengContent } from "./type";
import {
  githubFrontEndTopicWorker,
  githubTrendingWorker,
  infoQFEWorker,
  juejinFEHotWorker,
  ruanYifengBlogWorker,
  ruanYifengAllBlogWorker,
  aliMaMaFEWorker,
} from "./workers";

const filterTimeSpan = 1000 * 3600 * CRAWLER_TIME_SPAN_HOURS;

type ProcessorResult = {
  partial: [frontMatter: string, entries: string[]];
  all: [frontMatter: string, entries: string[]];
};

export const ruanYifengBlogProcessor = async (): Promise<ProcessorResult> => {
  const allFrontMatter = `## 阮一峰技术博客`;
  const partialFrontMatter = `## 阮一峰技术博客最新博文`;

  try {
    const latestArticles = await ruanYifengAllBlogWorker();

    log(`阮一峰博客最新 ${latestArticles.length} 条`);

    const now = new Date().getTime();

    const filteredLatestArticles = latestArticles.filter(
      (article) => article.cTime + filterTimeSpan >= now
    );

    const allForReference = filteredLatestArticles.reduce<
      Record<string, RuanYifengContent>
    >((rec, article) => {
      rec[article.link] = article;
      return rec;
    }, {});

    const topics = await Promise.all(
      CRAWLER_RUANYIFENG_TOPICS.map((topic) =>
        ruanYifengBlogWorker(topic)
      )
    );
    const latestTopics = topics.map(topic => topic.filter(article => !!allForReference[article.link]))

    const totalArticles = topics.flatMap((topic) => topic);
    const totalLatestArticles = latestTopics.flatMap((topic) => topic);

    log(`阮一峰博客 ${totalLatestArticles.length}/${totalArticles.length} 条`);

    topics.forEach((topic, index) => {
      if (CRAWLER_RUANYIFENG_TOPICS[index]) {
        log(
          `阮一峰博客 ${CRAWLER_RUANYIFENG_TOPICS[index]} 专题 ${latestTopics[index].length}/${topic.length} 条`
        );
      }
    });

    return {
      all: [allFrontMatter, totalArticles.map((article) => 
        `* **[${article.title}](${article.link})**`,
      )],
      partial: [partialFrontMatter, totalLatestArticles.map((article) => 
        `* **[${article.title}](${article.link})** *评论数：${article.commentCount}*`,
      )],
    };
  } catch (error) {
    log(`阮一峰博客 请求错误 ${error.toString()}`, "error");

    return {
      all: [allFrontMatter, []],
      partial: [partialFrontMatter, []],
    };
  }
};

export const githubFrontEndTopicProcessor =
  async (): Promise<ProcessorResult> => {
    const allFrontMatter = `## Github 前端专题榜`;
    const partialFrontMatter = `## Github 前端专题榜 TOP${CRAWLER_TOP_COUNT}`;

    try {
      const articles = await githubFrontEndTopicWorker();

      log(`Github 前端专题榜 ${articles.length} 条`);

      return {
        all: [
          allFrontMatter,
          articles
            .map((article) => [
              `* **[${article.title}](${article.link})** *${article.language} ｜ ⭐️：${article.stars}*`,
              `> ${article.content}`,
            ])
            .flat(),
        ],
        partial: [
          partialFrontMatter,
          articles
            .slice(0, CRAWLER_TOP_COUNT)
            .map((article) => [
              `* **[${article.title}](${article.link})** *${article.language} ｜ ⭐️：${article.stars}*`,
              `> ${article.content}`,
            ])
            .flat(),
        ],
      };
    } catch (error) {
      log(`Github 前端专题榜请求错误 ${error.toString()}`, "error");

      return {
        all: [allFrontMatter, []],
        partial: [partialFrontMatter, []],
      };
    }
  };

export const githubTrendingProcessor = async (): Promise<ProcessorResult> => {
  const allFrontMatter = `## Github TS/JS 今日流行趋势`;
  const partialFrontMatter = `## Github TS TOP ${CRAWLER_TOP_COUNT}/JS TOP ${CRAWLER_TOP_COUNT} 今日流行趋势`;

  try {
    const [githubTrendingTS, githubTrendingJS] = await Promise.all([
      githubTrendingWorker("Typescript"),
      githubTrendingWorker("Javascript"),
    ]);

    log(`Github 趋势榜（Typescript）${githubTrendingTS.length} 条`);
    log(`Github 趋势榜（Javascript）${githubTrendingJS.length} 条`);

    const githubTrending = [...githubTrendingTS, ...githubTrendingJS];

    const partialGithubTrending = [
      ...githubTrendingTS.slice(0, CRAWLER_TOP_COUNT),
      ...githubTrendingJS.slice(0, CRAWLER_TOP_COUNT),
    ];

    return {
      all: [
        allFrontMatter,
        githubTrending
          .map((article) => [
            `* **[${article.title}](${article.link})** *${article.language} ｜ fork：${article.forks} | ⭐️：${article.stars} | 今日 ⭐️：${article.todayStars}*`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
      partial: [
        partialFrontMatter,
        partialGithubTrending
          .map((article) => [
            `* **[${article.title}](${article.link})** *${article.language}`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
    };
  } catch (error) {
    log(`Github 趋势榜请求错误 ${error.toString()}`, "error");

    return {
      all: [allFrontMatter, []],
      partial: [partialFrontMatter, []],
    };
  }
};

export const juejinHotProcessor = async (): Promise<ProcessorResult> => {
  const allFrontMatter = `## 掘金前端热贴`;
  const partialFrontMatter = `## 掘金 24 小时内最新前端热贴`;

  try {
    const articles = await juejinFEHotWorker();

    const now = new Date().getTime();

    const latestArticles = articles.filter(
      (article) => article.cTime + filterTimeSpan >= now
    );

    log(`掘金前端热帖结果 ${latestArticles.length}/${articles.length} 条`);

    return {
      all: [
        allFrontMatter,
        articles
          .map((article) => [
            `* **[${article.title}](${article.link})** *作者：${article.authorName} ｜ 评论数：${article.commentCount} | 浏览数：${article.viewCount} | 🧡：${article.diggCount}*`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
      partial: [
        partialFrontMatter,
        latestArticles
          .map((article) => [
            `* **[${article.title}](${article.link})** *作者：${article.authorName} ｜ 评论数：${article.commentCount} | 浏览数：${article.viewCount} | 🧡：${article.diggCount}*`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
    };
  } catch (error) {
    log(`掘金前端热帖请求错误 ${error.toString()}`, "error");

    return {
      all: [allFrontMatter, []],
      partial: [partialFrontMatter, []],
    };
  }
};

export const infoQFEProcessor = async (): Promise<ProcessorResult> => {
  const allFrontMatter = `## InfoQ 前端之巅前端热贴`;
  const partialFrontMatter = `## InfoQ 前端之巅 24 小时内最新前端热贴`;

  try {
    const articles = await infoQFEWorker();

    const now = new Date().getTime();

    const latestArticles = articles.filter(
      (article) => article.cTime + filterTimeSpan >= now
    );

    log(`InfoQ 前端之巅结果 ${latestArticles.length}/${articles.length} 条`);

    return {
      all: [
        allFrontMatter,
        articles
          .map((article) => [
            `* **[${article.title}](${article.link})** *作者：${article.authors}*`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
      partial: [
        partialFrontMatter,
        latestArticles
          .map((article) => [
            `* **[${article.title}](${article.link})** *作者：${article.authors}*`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
    };
  } catch (error) {
    log(`InfoQ 前端之巅请求错误 ${error.toString()}`, "error");

    return {
      all: [allFrontMatter, []],
      partial: [partialFrontMatter, []],
    };
  }
};

export const aliMaMaFeProcessor = async (): Promise<ProcessorResult> => {
  const allFrontMatter = `## 阿里妈妈前端快爆`;
  const partialFrontMatter = `## 阿里妈妈前端快爆 24 小时内最新发布`;

  try {
    const articles = await aliMaMaFEWorker();

    const now = new Date().getTime();

    const latestArticles = articles.filter(
      (article) => article.cTime + filterTimeSpan >= now
    );

    log(`阿里妈妈前端快爆结果 ${latestArticles.length}/${articles.length} 条`);

    return {
      all: [
        allFrontMatter,
        articles
          .map((article) => [
            `* **[${article.title}](${article.link})** *🧡：${article.voteUp}*`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
      partial: [
        partialFrontMatter,
        latestArticles
          .map((article) => [
            `* **[${article.title}](${article.link})** *🧡：${article.voteUp}*`,
            `> ${article.content}`,
          ])
          .flat(),
      ],
    };
  } catch (error) {
    log(`阿里妈妈前端快爆请求错误 ${error.toString()}`, "error");

    return {
      all: [allFrontMatter, []],
      partial: [partialFrontMatter, []],
    };
  }
};
