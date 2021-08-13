export type CrawlerContent = {
  title: string;
  content: string;
  link: string;
};

export type GithubFrontEndTopic = CrawlerContent & {
  language?: string;
  stars: string;
};

export type GithubTrendingContent = CrawlerContent & {
  language: "Typescript" | "Javascript";
  forks: string;
  stars: string;
  todayStars: string;
};

export type HackNewsContent = CrawlerContent & {};

export type JuejinContent = CrawlerContent & {
  authorName: string;
  commentCount: string;
  diggCount: string;
  viewCount: string;
  cTime: number;
};

export type InfoQFEContent = CrawlerContent & {
  authors: string;
  cTime: number;
};

export type RuanYifengContent = CrawlerContent & {
  commentCount: string;
  cTime: number;
};
