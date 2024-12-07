const bot = require("./app");
const { addBusinessDays, format } = require("date-fns");
const { uk } = require("date-fns/locale"); // Локализация для Украины, если нужно
const axios = require("axios");
const {
  WHOLESALE_TG_ID,
  WHOLESALE_TREED_ID,
  RETAIL_ORDER_TG_ID,
  RETAIL_ORDER_TREED_ID,
  TECH_SUPPORT_TG_ID,
  TECH_SUPPORT_TREED_ID,
  COLLABORATION_TG_ID,
  BITRIX24_SERVICE_GROUP_ID,
  BITRIX24_SERVICE_RESPONSIBLE_1_ID,
  BITRIX24_SERVICE_RESPONSIBLE_2_ID,
  BITRIX24_SERVICE_RESPONSIBLE_3_ID,
  BITRIX24_WEBHOOK_URL,
  WHOLESALE_INQUIRY_RESPONSIBLE_ID,
  RETAIL_ORDER_INQUIRY_RESPONSIBLE_ID,
  TECH_SUPPORT_INQUIRY_RESPONSIBLE_ID,
} = process.env;
const {
  contactsMessageText,
  faqMessageTextPlotter,
  faqMessageTextGlass,
  faqMessageTextFilm,
} = require("./constant/messages");

const commands = ["/start", "/contacts"];

const setBotCommands = () => {
  bot.setMyCommands([
    { command: "/start", description: "Залишити заявку" },
    { command: "/contacts", description: "Контакти" },
  ]);

  bot.on("message", async msg => {
    try {
      const chatId = msg.chat.id;
      const text = msg.text;
      console.log(`chatId`, chatId, msg.chat);
      if (text == "@ArmorStandartBot show group id") {
        console.log(
          `Chat ID: ${msg.chat.id}, Thread ID: ${
            msg.message_thread_id || null
          }, Title: ${msg.chat.title}, Type: ${msg.chat.type}`
        );
        // console.log(`msg.message_thread_id`, msg);

        return bot.sendMessage(
          chatId,
          `group id: ${msg.chat.id}, group title: ${msg.chat.title}, thread id: ${msg.message_thread_id},  type: ${msg.chat.type}`,
          { parse_mode: "Markdown" }
        );
      }

      if (text === "/start") {
        // Показываем меню для выбора типа запроса
        await bot.sendMessage(
          chatId,
          "<b>Оберіть тип звернення, який вам підходить:</b>\n\n",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📦 Гуртова співпраця",
                    callback_data: "wholesale",
                  },
                ],
                [
                  {
                    text: "🛍️ Роздрібні замовлення",
                    callback_data: "retail",
                  },
                ],
                [{ text: "🛠️ Сервісний центр", callback_data: "support" }],
                [
                  {
                    text: "🤝 Пропозиція про співпраці",
                    callback_data: "collaboration",
                  },
                ],
              ],
            },
          }
        );
        // await bot.sendMessage(
        //   chatId,
        //   "<b>Оберіть тип звернення, який вам підходить:</b>\n\n"
        //    +
        //     "1. 📦 Гуртові замовлення\n" +
        //     "2. 🛍️ Роздрібні замовлення\n" +
        //     "3. 🛠️ Сервісний центр\n" +
        //     "4. 🤝 Пропозиція про співпраці",
        //   {
        //     parse_mode: "HTML",
        //     reply_markup: {
        //       inline_keyboard: [
        //         [
        //           {
        //             text: "📦 Гуртова співпраця",
        //             callback_data: "wholesale",
        //           },
        //         ],
        //         [
        //           {
        //             text: "🛍️ Роздрібні замовлення",
        //             callback_data: "retail",
        //           },
        //         ],
        //         [{ text: "🛠️ Сервісний центр", callback_data: "support" }],
        //         [{ text: "🤝 Пропозиція про співпраці", callback_data: "collaboration" }],
        //       ],
        //     },
        //   }
        // );
      }

      if (text === "/contacts") {
        const stickerUrl = "./img/inline/girl_map.jpg";
        return bot.sendPhoto(chatId, stickerUrl, {
          caption: contactsMessageText,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              // [
              //   {
              //     text: "Відкрити карту",
              //     url: "https://goo.gl/maps/jmE55U1KPn1GXXWW9",
              //   },
              // ],
            ],
          },
        });
      }
    } catch (error) {
      console.error("Ошибка в обработчике сообщения:", error.message);
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

      // Убираем клавиатуру
      await bot.editMessageReplyMarkup(
        {
          inline_keyboard: [[]], // Пустая клавиатура
        },
        { chat_id: chatId, message_id: messageId }
      );

      // Запрашиваем контакт
      await bot.sendMessage(
        chatId,
        "Будь ласка, поділіться своїм контактом, щоб ми могли зв'язатися з вами. Без цього ви не зможете надіслати нам повідомлення.",
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

      // Уникальный обработчик для каждого типа запроса
      const contactHandler = async userMsg => {
        if (userMsg.chat.id !== chatId || userMsg.chat.type !== "private") {
          return; // Игнорируем сообщения из других чатов
        }

        if (userMsg.contact) {
          const { first_name, last_name, phone_number } = userMsg.contact;

          // bot.removeListener("contact", contactHandler);

          // Даем пользователю возможность оставить комментарий
          await bot.sendMessage(
            chatId,
            "Тепер ви можете залишити ваш коментар."
          );

          // Уникальный обработчик для комментариев
          const commentHandler = async commentMsg => {
            if (
              commentMsg.chat.id !== chatId ||
              commentMsg.chat.type !== "private"
            ) {
              return; // Игнорируем сообщения из других чатов
            }

            if (commands.includes(commentMsg.text)) {
              bot.removeListener("message", commentHandler);
              await bot.sendMessage(
                chatId,
                "Запит на коментар було скасовано."
              );
              return; // Прерываем выполнение
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

            let responsibleTag = ""; // Переменная для тега ответственного менеджера
            let tgGroupId = "";
            let gtTreedId = "";

            if (data === "wholesale") {
              responsibleTag = `\n\n${WHOLESALE_INQUIRY_RESPONSIBLE_ID}`;
              tgGroupId = WHOLESALE_TG_ID;
              gtTreedId = WHOLESALE_TREED_ID;
            } else if (data === "retail") {
              responsibleTag = `\n\n${RETAIL_ORDER_INQUIRY_RESPONSIBLE_ID}`;
              tgGroupId = RETAIL_ORDER_TG_ID;
              gtTreedId = RETAIL_ORDER_TREED_ID;
            } else if (data === "support") {
              tgGroupId = TECH_SUPPORT_TG_ID;
              gtTreedId = TECH_SUPPORT_TREED_ID;
              responsibleTag = `\n\n${TECH_SUPPORT_INQUIRY_RESPONSIBLE_ID}`;
            } else if (data === "collaboration") {
              tgGroupId = COLLABORATION_TG_ID;
            }

            const adminMessage = `
    Новий запит від користувача:\n
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
    - <b>Текст повідомлення:</b>
    
    "${commentText}" 
   
          `;

            // Отправляем сообщение в Telegram
            const messageOptions = {
              parse_mode: "HTML",
            };

            if (gtTreedId) {
              messageOptions.message_thread_id = gtTreedId;
            }

            await bot.sendMessage(
              tgGroupId,
              adminMessage + responsibleTag,
              messageOptions
            );

            // COLLABORATION_TG_ID
            // await bot.sendMessage(
            //   "-1002086154595",
            //   adminMessage + responsibleTag,
            //   {
            //     parse_mode: "HTML",
            //     message_thread_id: "3",
            //   }
            // );

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
            const bitrix24ResponsibleId =
              data === "wholesale"
                ? BITRIX24_SERVICE_RESPONSIBLE_2_ID
                : data === "collaboration"
                ? BITRIX24_SERVICE_RESPONSIBLE_3_ID
                : BITRIX24_SERVICE_RESPONSIBLE_1_ID;

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
                RESPONSIBLE_ID: bitrix24ResponsibleId,
                // RESPONSIBLE_ID: BITRIX24_SERVICE_RESPONSIBLE_1_ID,
                // ACCOMPLICES: [BITRIX24_SERVICE_RESPONSIBLE_2_ID],
                DEADLINE: formattedDeadline,
                GROUP_ID: BITRIX24_SERVICE_GROUP_ID,
                PRIORITY: 2,
              },
            };

            // console.log(`taskData`, taskData);

            try {
              await axios.post(
                BITRIX24_WEBHOOK_URL + "/tasks.task.add",
                taskData
              );

              // Получение ID созданной задачи
              // const taskId = response.data.result.task.id; // ID задачи
            } catch (error) {
              console.error(
                "Ошибка при создании задачи в Bitrix24:",
                error.message
              );
            }

            // Удаляем обработчики, чтобы не создавать новые задачи
            bot.removeListener("message", commentHandler);
          };

          // Добавляем обработчик комментария
          bot.on("message", commentHandler);

          // Удаляем обработчик контакта
          bot.removeListener("contact", contactHandler);
        } else {
          await bot.sendMessage(
            chatId,
            "Для продовження, будь ласка, поділіться своїм контактом."
          );
        }
      };

      // Добавляем обработчик контакта
      bot.on("contact", contactHandler);
    } catch (error) {
      console.error("Ошибка в обработчике callback_query:", error.message);
      await bot.sendMessage(
        query.message.chat.id,
        "На жаль, сталася помилка. Спробуйте пізніше."
      );
    }
  });
};

module.exports = { setBotCommands };
