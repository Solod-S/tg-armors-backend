const dotenv = require("dotenv");
const cron = require("node-cron");
const {
  endOfMonth,
  isWeekend,
  getDay,
  subDays,
  isSameDay,
} = require("date-fns");

const { googleSheetCronEventCheck } = require("./utils/cronOperations");
const {
  escapeMarkdown,
  getRandomGreeting,
  getRandomFarewell,
} = require("./utils/helpers");
const {
  contactsMessageText,
  faqMessageText,
  cron1cMessageText,
} = require("./constant/messages");

const { bot } = require("./app");

const cronStickerUrl = "./img/inline/1c_1.gif";
// product
const chatId = "-215426713";
// test
// const chatId = "-1002086154595";

dotenv.config();

// npm run startarmors
// npm run stoparmors

cron.schedule("0 * * * *", async () => {
  try {
    const tasks = await googleSheetCronEventCheck();
    console.log(`current tasks:`, tasks);
    if (tasks.length > 0) {
      for (const task of tasks) {
        const fullSet =
          task.chatId &&
          task.text &&
          task.chatId.trim() !== "" &&
          task.text.trim() !== "";

        if (fullSet) {
          const chatId = task.chatId.trim();
          const text = task.text.trim();
          const escapedText = escapeMarkdown(text);

          // Logging the text to check for issues
          console.log(`Sending message to ${chatId}: ${escapedText}`);

          try {
            await bot.sendMessage(chatId, escapedText, {
              parse_mode: "MarkdownV2",
            });
          } catch (sendError) {
            console.log(`Error sending message to ${chatId}: ${sendError}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`Error in google sheet cron: ${error}`);
  }
});

cron.schedule("0 19 * * *", () => {
  const currentDate = new Date();
  const lastDayOfMonth = endOfMonth(currentDate);

  if (isSameDay(currentDate, lastDayOfMonth)) {
    bot.sendAnimation(chatId, cronStickerUrl, {
      caption: cron1cMessageText,
      parse_mode: "Markdown",
    });
  }
});

cron.schedule("0 18 * * *", () => {
  const currentDate = new Date();
  let lastWorkDayOfMonth = endOfMonth(currentDate);

  // Идем от последнего дня месяца назад до тех пор, пока не найдем рабочий день
  while (isWeekend(lastWorkDayOfMonth)) {
    lastWorkDayOfMonth = subDays(lastWorkDayOfMonth, 1);
  }

  // Проверяем, совпадает ли последний рабочий день месяца с сегодняшним днем
  if (isSameDay(currentDate, lastWorkDayOfMonth)) {
    bot.sendAnimation(chatId, cronStickerUrl, {
      caption: cron1cMessageText,
      parse_mode: "Markdown",
    });
  }
});

// Расписание для отправки приветствий в будние дни в 9:00 утра (понедельник-пятница)
cron.schedule("0 9 * * 1-5", () => {
  bot.sendMessage(chatId, getRandomGreeting(), { parse_mode: "Markdown" });
});

// Расписание для отправки прощаний в будние дни в 18:00 вечера (понедельник-пятница)
cron.schedule("0 18 * * 1-5", () => {
  bot.sendMessage(
    chatId,
    getRandomFarewell() +
      "\n\nНе забувайте закрити 1С наприкінці робочого дня.",
    { parse_mode: "Markdown" }
  );
});

// bot.sendMessage(
//   "-215426713",
//   randomFarewell + "\n\nНе забувайте закрити 1С наприкінці робочого дня.",
//   { parse_mode: "Markdown" }
// );

// bot.sendAnimation(chatId, cronStickerUrl, {
//   caption: cron1cMessageText,
//   parse_mode: "Markdown",
// });

// bot.sendMessage(chatId, getRandomGreeting(), { parse_mode: "Markdown" });

bot.setMyCommands([
  { command: "/contacts", description: "Контакти" },
  { command: "/faq", description: "Питання, що часто задаються" },
  // { command: "/app", description: "Про нас" },
]);

bot.on("message", async msg => {
  // console.log(`msg.chat`, msg.chat);
  // console.log(`msg.text`, msg.text);
  // console.log(`msg`, msg);
  // слушатель событий сообщения
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text == "@ArmorStandartBot show group id") {
    return bot.sendMessage(
      chatId,
      `id: ${msg.chat.id}, title: ${msg.chat.title}, type: ${msg.chat.type}`,
      { parse_mode: "Markdown" }
    );
  }

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
