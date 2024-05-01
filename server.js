const dotenv = require("dotenv");
const cron = require("node-cron");
const { isLastFridayOfMonth } = require("date-fns");
const {
  contactsMessageText,
  faqMessageText,
  cron1cMessageText,
} = require("./constant/messages");
const { bot } = require("./app");

const cronStickerUrl = "./img/inline/1c_1.gif";

const chatId = "-1002086154595";

dotenv.config();

cron.schedule("0 17 * * 5", () => {
  // Проверяем, является ли текущая дата последней пятницей месяца
  if (isLastFridayOfMonth(new Date())) {
    // bot.sendMessage(chatId, cron1cMessageText);
    bot.sendAnimation(chatId, cronStickerUrl, {
      caption: cron1cMessageText,
      parse_mode: "Markdown",
    });
  }
});
bot.sendAnimation(chatId, cronStickerUrl, {
  caption: cron1cMessageText,
  parse_mode: "Markdown",
});
bot.setMyCommands([
  { command: "/contacts", description: "Контакти" },
  { command: "/faq", description: "Питання, що часто задаються" },
  // { command: "/app", description: "Про нас" },
]);

bot.on("message", async msg => {
  // console.log(`msg`, msg.chat);
  // слушатель событий сообщения
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text == "/contacts") {
    const stickerUrl = "./img/inline/girl_map.jpg";
    return bot.sendPhoto(chatId, stickerUrl, {
      caption: contactsMessageText,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Відкрити карту",
              url: "https://goo.gl/maps/jmE55U1KPn1GXXWW9",
            },
          ],
        ],
      },
    });
  }
  if (text == "/faq") {
    const stickerUrl = "./img/inline/faq1.jpg";

    await bot.sendPhoto(chatId, stickerUrl, {
      caption: faqMessageText,
      parse_mode: "HTML",
    });
  }
});
