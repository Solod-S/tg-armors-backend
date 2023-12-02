const dotenv = require("dotenv");
const shortid = require("shortid");

const { addRow } = require("./utils/googleSheets");
const { format } = require("date-fns");

dotenv.config();
const { WEB_APP_URL } = process.env;

const { bot } = require("./app");

bot.setMyCommands([
  { command: "/contacts", description: "Контакти" },
  { command: "/faq", description: "Питання, що часто задаються" },
  // { command: "/app", description: "Про нас" },
]);

bot.on("message", async (msg) => {
  // слушатель событий сообщения
  const chatId = msg.chat.id;
  const text = msg.text;
  const currentDate = new Date();
  const formattedDate = format(currentDate, "dd.MM.yyyy");
  const formattedTime = format(currentDate, "HH:mm");

  // if (text == "/app") {
  //   return bot.sendPhoto(chatId, "./img/inline/app.jpg", {
  //     caption:
  //       "Давайте розпочнемо 👨‍💻 Натисніть кнопку нижче, щоб ознайомитись з моїм функціоналом!",
  //     parse_mode: "Markdown",
  //     reply_markup: {
  //       inline_keyboard: [
  //         [{ text: "Відкрити меню", web_app: { url: WEB_APP_URL } }],
  //       ],
  //     },
  //   });
  // }
  if (text == "/contacts") {
    const stickerUrl = "./img/inline/girl_map.jpg";
    const messageText =
      `.......................................\n` +
      `*Зв'язатиcь з нами:*\n` +
      `.......................................\n` +
      `*Тел:*  (097) 944-61-71\n` +
      `*Пошта:* info@armors.com.ua\n` +
      `*Cайт:* armors.com.ua\n` +
      `.......................................\n` +
      `*Час роботи:*\n` +
      `.......................................\n` +
      `*Пн-Пт:*  9:00 - 18:00\n` +
      `*Сб-Нд:* вихідний\n`;

    return bot.sendPhoto(chatId, stickerUrl, {
      caption: messageText,
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
    const messageText = `
    _______________
  .......................................
    <b>Faq:</b>
  .......................................

    <b>Плотери:</b>
    <a href="https://www.youtube.com/watch?v=r6zRmYPvM7M"><b>Як замінити ножа на плотері ArmorStandart ASG</b></a> 
    <a href="https://www.youtube.com/watch?v=vf-LtpP4ge8"><b>Як замінити ножа на плотері ArmorStandart ASG2</b></a> 
    <a href="https://www.youtube.com/watch?v=xZMgLoGhxAg"><b>Як підключити плоттер ArmorStandart ASG2</b></a> 
    <a href="https://www.youtube.com/watch?v=c_iGNlYQNjo"><b>Порізка планшетноі плівки на плоттері ArmorStandart ASG2</b></a> 
    <a href="https://www.youtube.com/watch?v=swGrO_Jynaw"><b>Як вирізати плівку на планшет на плоттері ArmorStandart ASG2</b></a>
    <a href="https://www.youtube.com/watch?v=iWQ6RN5Gwhc"><b>Як вставляти плівку з автоподачею на плоттері ArmorStandart ASG2</b></a>

    <b>Плівки/Скло:</b>
    <a href="https://www.youtube.com/watch?v=qdQBMV_HewE"><b>Як наклеїти захисну плівку на смартфон</b></a>
    <a href="https://www.youtube.com/watch?v=-quEB9pbpsE"><b>Як наклеїти захисне скло на смартфон</b></a>
    _______________
 
  `;

    await bot.sendPhoto(chatId, stickerUrl, {
      caption: messageText,
      parse_mode: "HTML",
    });
  }
});
