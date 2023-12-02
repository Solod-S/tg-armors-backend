const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");

dotenv.config();

const { webDataRouter } = require("./routes/index");
const { TOKEN } = process.env;

const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/web-data", webDataRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = { app, bot };
