import Crawler from "crawler";
import fetch from "node-fetch";
import {
  AliMaMaFEContent,
  GithubFrontEndTopic,
  GithubTrendingContent,
  InfoQFEContent,
  JuejinContent,
  RuanYifengContent,
} from "./type";
import { formatNumber, nonNull } from "./utils";

const crawler = new Crawler({
  maxConnections: 10,
});

export const ruanYifengAllBlogWorker = async () => {
  const uri = `https://www.ruanyifeng.com/blog/archives.html`;

  return await new Promise<RuanYifengContent[]>((resolve, reject) =>
    crawler.queue([
      {
        uri,
        callback: function (error, res, done) {
          if (error) {
            reject(error);
          } else {
            try {
              const articles$ = res.$("#alpha li.module-list-item");

              const articles: RuanYifengContent[] = articles$
                .map((idx) => {
                  const article$ = articles$.eq(idx);

                  const title$ = article$.find("a").first();
                  const hint$ = article$.find(".hint").first();
                  const title = title$
                    .text()
                    .trim()
                    .replace(/(<[\w\s]+>)/g, "`$1`");
                  const commentCount = hint$.text().replace(/\D/g, "");
                  const timeText = article$
                    .text()
                    .replace(/\s+/g, " ")
                    .trim()
                    .replace(title, "")
                    .replace(commentCount, "")
                    .slice(0, -1);
                  const [year, month, day] = timeText
                    .split(".")
                    .map((part) => parseInt(part)) as [
                    year: number,
                    month: number,
                    day: number
                  ];
                  const cTimeDate = new Date();
                  cTimeDate.setFullYear(year);
                  cTimeDate.setMonth(month - 1);
                  cTimeDate.setDate(day);
                  cTimeDate.setHours(0);
                  cTimeDate.setMinutes(0);
                  cTimeDate.setSeconds(0);

                  const article: RuanYifengContent = {
                    link: title$.attr("href") ?? "",
                    title,
                    content: "",
                    cTime: cTimeDate.getTime(),
                    commentCount,
                  };

                  return article;
                })
                .get();

              resolve(articles);
            } catch (e) {
              reject(e);
            }
          }
          done();
        },
      },
    ])
  );
};

export const ruanYifengBlogWorker = async (category: string) => {
  const uri = `https://www.ruanyifeng.com/blog/${category}/`;

  return (
    await new Promise<Array<RuanYifengContent>>((resolve, reject) =>
      crawler.queue([
        {
          uri,
          callback: function (error, res, done) {
            if (error) {
              reject(error);
            } else {
              try {
                const articles$ = res.$("#alpha li.module-list-item");

                const articles: RuanYifengContent[] = articles$
                  .map((idx) => {
                    const article$ = articles$.eq(idx);

                    const title$ = article$.find("a").first();

                    const title = title$
                      .text()
                      .trim()
                      .replace(/(<[\w\s]+>)/g, "`$1`");

                    const article: RuanYifengContent = {
                      link: title$.attr("href") ?? "",
                      title,
                      content: "",
                      cTime: 0,
                      commentCount: "",
                    };

                    return article;
                  })
                  .get();

                resolve(articles);
              } catch (e) {
                reject(e);
              }
            }
            done();
          },
        },
      ])
    )
  ).filter(nonNull);
};

export const githubFrontEndTopicWorker = async () => {
  const uri = "https://github.com/topics/front-end";

  return await new Promise<GithubFrontEndTopic[]>((resolve, reject) =>
    crawler.queue([
      {
        uri,
        callback: function (error, res, done) {
          if (error) {
            reject(error);
          } else {
            try {
              const topicArticles$ = res.$(".topic article.border");

              const topicArticles: GithubFrontEndTopic[] = topicArticles$
                .map((idx) => {
                  const topicArticle$ = topicArticles$.eq(idx);

                  const topicTitle$ = topicArticle$.find("h3").first();
                  const topicContent$ = topicArticle$
                    .find(".color-bg-primary p.color-text-secondary")
                    .first();
                  const topicLink$ = topicArticle$.find("a.text-bold").first();
                  const topicStar$ = topicArticle$
                    .find(".social-count")
                    .first();
                  const language$ = topicArticle$
                    .find('[itemprop="programmingLanguage"]')
                    .first();

                  const topicArticle: GithubFrontEndTopic = {
                    link: topicLink$.attr("href") ?? "",
                    title: topicTitle$
                      .text()
                      .replace(/\s+/g, " ")
                      .replace(" / ", "/")
                      .trim()
                      .replace(/(<[\w\s]+>)/g, "`$1`"),
                    content: topicContent$
                      .text()
                      .trim()
                      .replace(/(<[\w\s]+>)/g, "`$1`"),
                    language: language$.text().trim(),
                    stars: topicStar$.text().trim(),
                  };

                  return topicArticle;
                })
                .get();

              resolve(topicArticles);
            } catch (e) {
              reject(e);
            }
          }
          done();
        },
      },
    ])
  );
};

export const githubTrendingWorker = async (
  language: "Typescript" | "Javascript"
) => {
  return new Promise<GithubTrendingContent[]>((resolve, reject) => {
    const uri = `https://github.com/trending/${language.toLowerCase()}?since=daily`;

    crawler.queue([
      {
        uri,
        callback: function (error, res, done) {
          if (error) {
            reject(error);
          } else {
            try {
              const boxRows$ = res.$(".Box-row");

              const trendArticles: GithubTrendingContent[] = boxRows$
                .map((idx) => {
                  const boxRow$ = boxRows$.eq(idx);
                  const boxRowTitle$ = boxRow$.find("h1 a").first();
                  const boxRowContent$ = boxRow$.find("p").first();
                  const boxRowSVGStar$ = boxRow$
                    .find('a svg[aria-label="star"]')
                    .first();
                  const boxRowSVGFork$ = boxRow$
                    .find('a svg[aria-label="fork"]')
                    .first();
                  const boxRowSVGTodayStar$ = boxRow$
                    .find("span svg.octicon-star")
                    .not('svg[aria-label="star"]')
                    .first();

                  const trendArticle: GithubTrendingContent = {
                    link: boxRowTitle$.attr("href") ?? "",
                    title: boxRowTitle$
                      .text()
                      .replace(/\s+/g, " ")
                      .trim()
                      .replace(" / ", "/")
                      .replace(/(<[\w\s]+>)/g, "`$1`"),
                    content: boxRowContent$
                      .text()
                      .replace(/\s+/g, " ")
                      .trim()
                      .replace(/(<[\w\s]+>)/g, "`$1`"),
                    language,
                    stars: formatNumber(
                      parseInt(
                        boxRowSVGStar$.parent().text().replace(/,/g, "").trim()
                      )
                    ),
                    forks: formatNumber(
                      parseInt(
                        boxRowSVGFork$.parent().text().replace(/,/g, "").trim()
                      )
                    ),
                    todayStars: formatNumber(
                      parseInt(
                        boxRowSVGTodayStar$
                          .parent()
                          .text()
                          .replace(/,/g, "")
                          .trim()
                      )
                    ),
                  };

                  return trendArticle;
                })
                .get();

              resolve(trendArticles);
            } catch (e) {
              reject(e);
            }
          }
          done();
        },
      },
    ]);
  });
};

export const juejinFEHotWorker = async () => {
  const articles: [
    {
      article_info: {
        article_id: string;
        brief_content: string;
        title: string;
        view_count: number;
        digg_count: number;
        comment_count: number;
        cTime: string;
      };
      author_user_info: {
        user_name: string;
      };
    }
  ] = (
    await (
      await fetch(
        "https://api.juejin.cn/recommend_api/v1/article/recommend_cate_tag_feed",
        {
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            id_type: 2,
            sort_type: 200,
            cate_id: "6809637767543259144",
            tag_id: "6809640407484334093",
            cursor: "0",
            limit: 20,
          }),
          method: "POST",
        }
      )
    ).json()
  )?.data;

  const resultArticles: JuejinContent[] = articles.map((article) => ({
    title: article.article_info.title.replace(/(<[\w\s]+>)/g, "`$1`"),
    content: article.article_info.brief_content.replace(/(<[\w\s]+>)/g, "`$1`"),
    link: `https://juejin.cn/post/${article.article_info.article_id}`,
    authorName: article.author_user_info.user_name,
    diggCount: formatNumber(article.article_info.digg_count),
    viewCount: formatNumber(article.article_info.view_count),
    commentCount: formatNumber(article.article_info.comment_count),
    cTime: +article.article_info.cTime * 1000,
  }));

  return resultArticles;
};

export const infoQFEWorker = async () => {
  const articles: [
    {
      uuid: string;
      publish_time: number;
      author?: [{ nickname: string }];
      no_author?: string;
      article_summary: string;
      article_title: string;
    }
  ] = (
    await (
      await fetch("https://www.infoq.cn/public/v1/article/getList", {
        headers: {
          Referer: "https://www.infoq.cn/topic/Front-end",
        },
        body: JSON.stringify({
          type: 0,
          size: 30,
          id: 33,
        }),
        method: "POST",
      })
    ).json()
  )?.data;

  const resultArticles: InfoQFEContent[] = articles.map((article) => ({
    title: article.article_title.replace(/(<[\w\s]+>)/g, "`$1`"),
    content: article.article_summary.replace(/(<[\w\s]+>)/g, "`$1`"),
    link: `https://www.infoq.cn/article/${article.uuid}`,
    authors:
      (article.no_author ||
        article.author?.map((a) => a.nickname).join(", ")) ??
      "",
    cTime: article.publish_time,
  }));

  return resultArticles;
};

export const aliMaMaFEWorker = async () => {
  const articles: [
    {
      excerpt: string;
      title: string;
      url: string;
      voteup_count: number;
      created: number;
    }
  ] = (
    await (
      await fetch("https://www.zhihu.com/api/v4/columns/mm-fe/items")
    ).json()
  )?.data;

  const resultArticles: AliMaMaFEContent[] = articles.map((article) => ({
    title: article.title.replace(/(<[\w\s]+>)/g, "`$1`"),
    content: article.excerpt.replace(/(<[\w\s]+>)/g, "`$1`"),
    link: article.url,
    voteUp: article.voteup_count,
    cTime: article.created * 1000,
  }));

  return resultArticles;
};
