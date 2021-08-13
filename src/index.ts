import { CRAWLER_PORT } from "./config/env";
import { Http } from "farrow-http";
import { services } from "./api";

const http = Http();

const port = CRAWLER_PORT;

http.use(services);

http.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
