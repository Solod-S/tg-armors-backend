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
    { command: "/faq", description: "Питання, що часто задаються" },
  ]);

  bot.on("message", async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/leave_request") {
      // return bot.sendMessage(chatId, "Оберіть тип звернення:", {
      //   reply_markup: {
      //     inline_keyboard: [
      //       [
      //         {
      //           text: "Запит на гуртову співпрацю",
      //           callback_data: "leave_request", // обработка кнопки
      //         },
      //         {
      //           text: "Запит з приводу роздрібних замовлень",
      //           callback_data: "leave_request", // обработка кнопки
      //         },
      //         {
      //           text: "Запит до техпідтримки",
      //           callback_data: "leave_request", // обработка кнопки
      //         },
      //         {
      //           text: "Хочу співпрацювати",
      //           callback_data: "leave_request", // обработка кнопки
      //         },
      //       ],
      //     ],
      //   },
      // });

      return bot.sendMessage(
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

  bot.on("callback_query", async query => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === "wholesale") {
      await bot.sendMessage(
        chatId,
        "Будь ласка, напишіть ваше повідомлення і вкажіть контактні дані. Ми вас уважно слухаємо!"
      );

      // Создаем отдельный обработчик для конкретного чата
      const messageHandler = async userMsg => {
        if (userMsg.chat.id !== chatId || userMsg.chat.type !== "private") {
          return; // Игнорируем сообщения из других чатов
        }

        const {
          message_id,
          from: { id: userId, first_name, last_name, username },
          date,
          text: userText,
        } = userMsg;

        // Преобразуем дату из UNIX в читаемый формат
        const formattedDate = new Date(date * 1000).toLocaleString("uk-UA", {
          timeZone: "Europe/Kiev",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        // Формируем сообщение для администратора
        const adminMessage = `
      Новий запит від користувача:
      - <b>Тип звернення:</b> 📦 Гуртова співпраця
      - <b>Ім'я:</b> ${first_name} ${last_name || ""}
      - <b>Нікнейм:</b> @${username || "немає"}
      - <b>ID користувача:</b> ${userId}
      - <b>ID повідомлення:</b> ${message_id}
      - <b>Дата/Час:</b> ${formattedDate}

      <b>Текст повідомлення:</b>
      "${userText}"
      `;

        // Отправляем сообщение администратору
        await bot.sendMessage(SERVICE_TG_ID, adminMessage, {
          parse_mode: "HTML",
          message_thread_id: SERVICE_TREED_ID,
        });

        // Подтверждаем пользователю
        await bot.sendMessage(
          chatId,
          "Дякуємо за ваше повідомлення! Наш менеджер зв'яжеться з вами найближчим часом."
        );

        // Рассчитываем дедлайн и формируем задачу для Bitrix24
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
              `📦 ${message_id} - Запит клієнта на гуртова співпрацю: ` +
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
          const response = await axios.post(BITRIX24_WEBHOOK_URL, taskData);
        } catch (error) {
          console.error("Ошибка при создании задачи в Bitrix24:", error);
        }

        // Убираем обработчик после обработки сообщения
        bot.removeListener("message", messageHandler);
      };

      // Регистрируем обработчик для текущего чата
      bot.on("message", messageHandler);
    }
  });
};

module.exports = {
  setBotCommands,
};
