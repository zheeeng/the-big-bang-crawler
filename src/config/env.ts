import * as dotenv from "dotenv";

dotenv.config();

export const CRAWLER_ACCESS_TOKEN = process.env.CRAWLER_ACCESS_TOKEN ?? "";
export const CRAWLER_RUANYIFENG_TOPICS = process.env.CRAWLER_RUANYIFENG_TOPICS?.split(',') ?? []
export const CRAWLER_PORT = +(process.env.PORT ?? '8868')
export const CRAWLER_TIME_SPAN_HOURS = +(process.env.CRAWLER_TIME_SPAN_HOURS ?? '12')
