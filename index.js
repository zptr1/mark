import "./src/client/index.js";

process.addListener("unhandledRejection", (e) => console.error(e));
process.addListener("uncaughtException", (e) => console.error(e));
