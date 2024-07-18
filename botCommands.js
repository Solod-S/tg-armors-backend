const bot = require("./app");
const {
  contactsMessageText,
  faqMessageTextPlotter,
  faqMessageTextGlass,
  faqMessageTextFilm,
} = require("./constant/messages");

const setBotCommands = () => {
  bot.setMyCommands([
    { command: "/contacts", description: "Контакти" },
    { command: "/faq", description: "Питання, що часто задаються" },
  ]);

  bot.on("message", async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text == "@ArmorStandartBot show group id") {
      console.log(
        `Chat ID: ${msg.chat.id}, Title: ${msg.chat.title}, Type: ${msg.chat.type}`
      );

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
      const faqMessageTextPlotterStickerUrl = "./img/inline/plotter.jpg";
      await bot.sendPhoto(chatId, faqMessageTextPlotterStickerUrl, {
        caption: faqMessageTextPlotter,
        parse_mode: "HTML",
      });
      // await bot.sendMessage(chatId, faqMessageTextGlass, {
      //   parse_mode: "HTML",
      // });
      const faqMessageTextGlassStickerUrl = "./img/inline/glass.jpg";
      await bot.sendPhoto(chatId, faqMessageTextGlassStickerUrl, {
        caption: faqMessageTextGlass,
        parse_mode: "HTML",
      });
      const faqMessageTextFilmStickerUrl = "./img/inline/film.jpg";
      await bot.sendPhoto(chatId, faqMessageTextFilmStickerUrl, {
        caption: faqMessageTextFilm,
        parse_mode: "HTML",
      });
    }
  });
};

module.exports = {
  setBotCommands,
};
