const TelegramBot = require("node-telegram-bot-api");
const { botToken } = require("./config");

const bot = new TelegramBot(botToken, { polling: true });


module.exports = bot;
