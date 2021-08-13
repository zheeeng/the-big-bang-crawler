export const log = (
  message: string,
  level: "info" | "error" = "info",
  time = new Date()
) => {
  if (level === "error") {
    console[level]("----------error-----------");
  } else {
    console[level]("--------------------------");
  }
  console[level](`| log time \t\t|\t message`);
  console[level](`| ${time.toLocaleString("zh-CN", {timeZone: "Asia/Shanghai"})}  \t|\t ${message}`);
  console[level]("--------------------------");
};
