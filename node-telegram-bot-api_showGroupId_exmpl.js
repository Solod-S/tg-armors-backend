const bot = require("./app");

const setBotCommands = () => {
  bot.on("message", async msg => {
    try {
      const chatId = msg.chat.id;
      const text = msg.text;
      if (text == "@ArmorStandartBot show group id") {
        console.log(
          `Chat ID: ${msg.chat.id}, Thread ID: ${
            msg.message_thread_id || null
          }, Title: ${msg.chat.title}, Type: ${msg.chat.type}`
        );

        return bot.sendMessage(
          chatId,
          `group id: ${msg.chat.id}, group title: ${msg.chat.title}, thread id: ${msg.message_thread_id},  type: ${msg.chat.type}`,
          { parse_mode: "Markdown" }
        );
      }
    } catch (error) {
      console.error("Ошибка в обработчике сообщения:", error.message);
      await bot.sendMessage(
        msg.chat.id,
        "На жаль, сталася помилка. Спробуйте пізніше."
      );
    }
  });
};

module.exports = { setBotCommands };
