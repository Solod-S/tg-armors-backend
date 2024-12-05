const bot = require("./app");
const { addBusinessDays, format } = require("date-fns");
const { uk } = require("date-fns/locale"); // Локализация для Украины, если нужно
const axios = require("axios");
const {
  SERVICE_TG_ID,
  SERVICE_TREED_ID,
  BITRIX24_SERVICE_GROUP_ID,
  BITRIX24_SERVICE_RESPONSIBLE_1_ID,
  BITRIX24_WEBHOOK_URL,
} = process.env;
const {
  contactsMessageText,
  faqMessageTextPlotter,
  faqMessageTextGlass,
  faqMessageTextFilm,
} = require("./constant/messages");

const setBotCommands = () => {
  bot.setMyCommands([
    { command: "/leave_request", description: "Залишити заявку" },
    { command: "/contacts", description: "Контакти" },
  ]);

  bot.on("message", async msg => {
    try {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (text === "/leave_request") {
        // Показываем меню для выбора типа запроса
        await bot.sendMessage(
          chatId,
          "<b>Оберіть тип звернення, який вам підходить:</b>\n\n" +
            "1. 📦 Гуртова співпраця для бізнесу\n" +
            "2. 🛍️ Роздрібні замовлення для покупців\n" +
            "3. 🛠️ Технічна підтримка для вирішення проблем\n" +
            "4. 🤝 Пропозиція про співпрацю",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "📦 Гуртова співпраця", callback_data: "wholesale" }],
                [{ text: "🛍️ Роздрібні замовлення", callback_data: "retail" }],
                [{ text: "🛠️ Техпідтримка", callback_data: "support" }],
                [{ text: "🤝 Співпраця", callback_data: "collaboration" }],
              ],
            },
          }
        );
      }

      if (text === "/contacts") {
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
    } catch (error) {
      console.error("Ошибка в обработчике сообщения:", error);
      await bot.sendMessage(
        msg.chat.id,
        "На жаль, сталася помилка. Спробуйте пізніше."
      );
    }
  });

  bot.on("callback_query", async query => {
    try {
      const chatId = query.message.chat.id;
      const data = query.data;
      const messageId = query.message.message_id;

      if (
        data === "wholesale" ||
        data === "retail" ||
        data === "support" ||
        data === "collaboration"
      ) {
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [[]],
          }, // Пустая клавиатура
          { chat_id: chatId, message_id: messageId }
        );

        // Запрашиваем контакт через кнопку "Поделиться контактами"
        await bot.sendMessage(
          chatId,
          "Будь ласка, поділіться своїм контактом.",
          {
            reply_markup: {
              keyboard: [
                [{ text: "Поділитися контактом", request_contact: true }],
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }
        );

        // Ожидаем, что пользователь поделится своим контактом
        const contactHandler = async userMsg => {
          if (userMsg.chat.id !== chatId || userMsg.chat.type !== "private") {
            return; // Игнорируем сообщения из других чатов
          }

          if (userMsg.contact) {
            const { first_name, last_name, phone_number } = userMsg.contact;

            // Даем пользователю возможность оставить комментарий
            await bot.sendMessage(
              chatId,
              "Тепер ви можете залишити ваш коментар."
            );

            // Обрабатываем комментарий
            const commentHandler = async commentMsg => {
              if (
                commentMsg.chat.id !== chatId ||
                commentMsg.chat.type !== "private"
              ) {
                return; // Игнорируем сообщения из других чатов
              }

              const {
                message_id,
                from: { id: userId, first_name, last_name, username },
                date,
                text: commentText,
              } = commentMsg;

              const formattedDate = new Date(date * 1000).toLocaleString(
                "uk-UA",
                {
                  timeZone: "Europe/Kiev",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              );

              const adminMessage = `
      Новий запит від користувача:
      - <b>Тип звернення:</b> ${
        data === "wholesale"
          ? "📦 Гуртова співпраця"
          : data === "retail"
          ? "🛍️ Роздрібні замовлення"
          : data === "support"
          ? "🛠️ Техпідтримка"
          : "🤝 Співпраця"
      }
      - <b>Ім'я:</b> ${first_name} ${last_name || ""}
      - <b>Нікнейм:</b> @${username || "немає"}
      - <b>Телефон:</b> ${phone_number}
      - <b>ID користувача:</b> ${userId}
      - <b>ID повідомлення:</b> ${message_id}
      - <b>Дата/Час:</b> ${formattedDate}
        
      <b>Текст повідомлення:</b>
      "${commentText}"
    `;

              // Отправляем сообщение в Telegram
              await bot.sendMessage(SERVICE_TG_ID, adminMessage, {
                parse_mode: "HTML",
                message_thread_id: SERVICE_TREED_ID,
              });

              await bot.sendMessage(
                chatId,
                "Дякуємо за ваше повідомлення! Наш менеджер зв'яжеться з вами найближчим часом."
              );

              // Добавляем задачу в Bitrix24
              const currentDate = new Date();
              const deadlineDate = addBusinessDays(currentDate, 1);
              const formattedDeadline = format(
                deadlineDate,
                "yyyy-MM-dd'T'HH:mm:ssXXX",
                { locale: uk }
              );

              const taskData = {
                fields: {
                  TITLE:
                    `${
                      data === "wholesale"
                        ? "📦 Гуртова співпраця"
                        : data === "retail"
                        ? "🛍️ Роздрібні замовлення"
                        : data === "support"
                        ? "🛠️ Техпідтримка"
                        : "🤝 Співпраця"
                    } ${message_id} - Запит клієнта: ` +
                    first_name +
                    " " +
                    (last_name || ""),
                  DESCRIPTION: adminMessage,
                  RESPONSIBLE_ID: BITRIX24_SERVICE_RESPONSIBLE_1_ID,
                  DEADLINE: formattedDeadline,
                  GROUP_ID: BITRIX24_SERVICE_GROUP_ID,
                  PRIORITY: 2,
                },
              };

              try {
                await axios.post(
                  BITRIX24_WEBHOOK_URL + "/tasks.task.add",
                  taskData
                );
              } catch (error) {
                console.error("Ошибка при создании задачи в Bitrix24:", error);
              }

              bot.removeListener("message", commentHandler);
            };

            bot.on("message", commentHandler);

            // Удаляем обработчик контактов, чтобы он не срабатывал снова
            bot.removeListener("message", contactHandler);
          } else {
            // Если контакт не был отправлен
            await bot.sendMessage(
              chatId,
              "Для продовження, будь ласка, поділіться своїм контактом."
            );
          }
        };

        // Ожидаем, что пользователь поделится своим контактом
        bot.on("contact", contactHandler);
      }
    } catch (error) {
      console.error("Ошибка в обработчике callback_query:", error);
      await bot.sendMessage(
        query.message.chat.id,
        "На жаль, сталася помилка. Спробуйте пізніше."
      );
    }
  });
};

module.exports = { setBotCommands };
