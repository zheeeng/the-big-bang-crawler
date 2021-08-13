import * as dotenv from "dotenv";

dotenv.config();

export const CRAWLER_ACCESS_TOKEN = process.env.CRAWLER_ACCESS_TOKEN ?? "";
export const CRAWLER_RUANYIFENG_TOPICS = process.env.CRAWLER_RUANYIFENG_TOPICS?.split(',') ?? []