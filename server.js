const dotenv = require("dotenv");
const cron = require("node-cron");
const {
  endOfMonth,
  isWeekend,
  getDay,
  subDays,
  isSameDay,
} = require("date-fns");
const {
  contactsMessageText,
  faqMessageText,
  cron1cMessageText,
  greetings,
  farewells,
} = require("./constant/messages");
const { bot } = require("./app");

const cronStickerUrl = "./img/inline/1c_1.gif";
// product
const chatId = "-215426713";
// test
// const chatId = "-1002086154595";

dotenv.config();

const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
const randomFarewell = farewells[Math.floor(Math.random() * farewells.length)];
// npm run startarmors
// npm run stoparmors

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
  bot.sendMessage(chatId, randomGreeting, { parse_mode: "Markdown" });
});

// Расписание для отправки прощаний в будние дни в 18:00 вечера (понедельник-пятница)
cron.schedule("0 18 * * 1-5", () => {
  bot.sendMessage(
    chatId,
    randomFarewell + "\n\nНе забувайте закрити 1С наприкінці робочого дня.",
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

// bot.sendMessage(chatId, randomGreeting, { parse_mode: "Markdown" });

bot.setMyCommands([
  { command: "/contacts", description: "Контакти" },
  { command: "/faq", description: "Питання, що часто задаються" },
  // { command: "/app", description: "Про нас" },
]);

bot.on("message", async msg => {
  console.log(`msg`, msg.chat);
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
