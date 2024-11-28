const bot = require("./app");
const { addBusinessDays, format } = require("date-fns"); // Импортируем нужные функции из date-fns
const { uk } = require("date-fns/locale"); // Локализация для Украины, если нужно
const axios = require("axios");
const {
  SERVICE_TG_ID,
  SERVICE_TREED_ID,
  BITRIX24_SERVICE_GROUP_ID,
  BITRIX24_SERVICE_RESPONSIBLE_ID,
  BITRIX24_SERVICE_WEBHOOK_URL,
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
      return bot.sendMessage(chatId, "Натисніть кнопку, щоб залишити заявку:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Залишити заявку",
                callback_data: "leave_request", // обработка кнопки
              },
            ],
          ],
        },
      });
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

  // bot.on("callback_query", async query => {
  //   const chatId = query.message.chat.id;
  //   const data = query.data;

  //   if (data === "leave_request") {
  //     await bot.sendMessage(
  //       chatId,
  //       "Будь ласка, напишіть ваше повідомлення і вкажіть контактні дані. Ми вас уважно слухаємо!"
  //     );

  //     bot.once("message", async userMsg => {
  //       const {
  //         message_id,
  //         from: { id: userId, first_name, last_name, username },
  //         date,
  //         text: userText,
  //       } = userMsg;

  //       // Преобразуем дату из UNIX в читаемый формат
  //       const formattedDate = new Date(date * 1000).toLocaleString("uk-UA", {
  //         timeZone: "Europe/Kiev",
  //         day: "2-digit",
  //         month: "2-digit",
  //         year: "numeric",
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         second: "2-digit",
  //       });

  //       // Формируем сообщение
  //       const adminMessage = `
  // Новий запит від користувача:
  // - <b>Ім'я:</b> ${first_name} ${last_name || ""}
  // - <b>Нікнейм:</b> @${username || "немає"}
  // - <b>ID:</b> ${userId}
  // - <b>ID повідомлення:</b> ${message_id}
  // - <b>Дата/Час:</b> ${formattedDate}

  // <b>Текст повідомлення:</b>
  // "${userText}"
  // `;

  //       // Логируем сообщение
  //       console.log(adminMessage);

  //       // Отправляем сообщение админу (или тому же пользователю, если нет отдельного ID)
  //       await bot.sendMessage(SERVICE_TG_ID, adminMessage, {
  //         parse_mode: "HTML",
  //         message_thread_id: SERVICE_TREED_ID,
  //       });

  //       // Отправляем подтверждение
  //       await bot.sendMessage(
  //         chatId,
  //         "Дякуємо за ваше повідомлення! Наш менеджер зв'яжеться з вами найближчим часом."
  //       );
  //     });
  //   }
  // });

  bot.on("callback_query", async query => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === "leave_request") {
      await bot.sendMessage(
        chatId,
        "Будь ласка, напишіть ваше повідомлення і вкажіть контактні дані. Ми вас уважно слухаємо!"
      );

      bot.once("message", async userMsg => {
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

        // Формируем сообщение
        const adminMessage = `
  Новий запит від користувача:
  - <b>Ім'я:</b> ${first_name} ${last_name || ""}
  - <b>Нікнейм:</b> @${username || "немає"}
  - <b>ID користувача:</b> ${userId}
  - <b>ID повідомлення:</b> ${message_id}
  - <b>Дата/Час:</b> ${formattedDate}

  <b>Текст повідомлення:</b>
  "${userText}"
  `;

        // Логируем сообщение
        console.log(adminMessage);

        // Отправляем сообщение админу (или тому же пользователю, если нет отдельного ID)
        await bot.sendMessage(SERVICE_TG_ID, adminMessage, {
          parse_mode: "HTML",
          message_thread_id: SERVICE_TREED_ID,
        });

        // Отправляем подтверждение
        await bot.sendMessage(
          chatId,
          "Дякуємо за ваше повідомлення! Наш менеджер зв'яжеться з вами найближчим часом."
        );
        // Рассчитываем дедлайн (прибавляем 1 рабочий день)
        const currentDate = new Date(); // Текущая дата
        const deadlineDate = addBusinessDays(currentDate, 1); // Прибавляем 1 рабочий день

        // Форматируем дедлайн в нужный формат для Bitrix24 (например, 2024-12-01T18:00:00+03:00)
        const formattedDeadline = format(
          deadlineDate,
          "yyyy-MM-dd'T'HH:mm:ssXXX",
          { locale: uk }
        );

        // Теперь создаем задачу в Bitrix24
        const taskData = {
          fields: {
            TITLE: "Запит клієнта: " + first_name + " " + (last_name || ""),
            DESCRIPTION: adminMessage, // Содержимое сообщения из Telegram
            RESPONSIBLE_ID: BITRIX24_SERVICE_RESPONSIBLE_ID, // ID исполнителя
            DEADLINE: formattedDeadline, // Дедлайн с учетом +1 рабочего дня
            GROUP_ID: BITRIX24_SERVICE_GROUP_ID, // ID группы
            PRIORITY: 2, // Приоритет
          },
        };

        // Отправляем POST-запрос на создание задачи в Bitrix24
        try {
          const response = await axios.post(
            BITRIX24_SERVICE_WEBHOOK_URL,
            taskData
          );
          console.log("Задача создана в Bitrix24:", response.data);
        } catch (error) {
          console.error("Ошибка при создании задачи в Bitrix24:", error);
        }
      });
    }
  });

  //   bot.on("callback_query", async query => {
  //     console.log(`0`);
  //     const chatId = query.message.chat.id;
  //     const data = query.data;

  //     if (data === "leave_request") {
  //       await bot.sendMessage(
  //         chatId,
  //         "Будь ласка, напишіть ваше повідомлення і вкажіть контактні дані. Ми вас уважно слухаємо!"
  //       );

  //       bot.on("callback_query", async query => {
  //         console.log(`1`)
  //         const chatId = query.message.chat.id;
  //         const data = query.data;

  //         if (data === "leave_request") {
  //           await bot.sendMessage(
  //             chatId,
  //             "Будь ласка, напишіть ваше повідомлення і вкажіть контактні дані. Ми вас уважно слухаємо!"
  //           );

  //           bot.once("message", async userMsg => {
  //             const {
  //               message_id,
  //               from: { id: userId, first_name, last_name, username },
  //               date,
  //               text: userText,
  //             } = userMsg;

  //             // Преобразуем дату из UNIX в читаемый формат
  //             const formattedDate = new Date(date * 1000).toLocaleString(
  //               "uk-UA",
  //               {
  //                 timeZone: "Europe/Kiev",
  //                 day: "2-digit",
  //                 month: "2-digit",
  //                 year: "numeric",
  //                 hour: "2-digit",
  //                 minute: "2-digit",
  //                 second: "2-digit",
  //               }
  //             );

  //             // Формируем сообщение для администратора
  //             const adminMessage = `
  // Новий запит від користувача:
  // - <b>Ім'я:</b> ${first_name} ${last_name || ""}
  // - <b>Нікнейм:</b> @${username || "немає"}
  // - <b>ID:</b> ${userId}
  // - <b>ID повідомлення:</b> ${message_id}
  // - <b>Дата/Час:</b> ${formattedDate}

  // <b>Текст повідомлення:</b>
  // "${userText}"
  // `;

  //             // Логируем сообщение
  //             console.log(adminMessage);

  //             // Отправляем сообщение админу (или тому же пользователю, если нет отдельного ID)
  //             await bot.sendMessage(SERVICE_TG_ID, adminMessage, {
  //               parse_mode: "HTML",
  //               message_thread_id: SERVICE_TREED_ID,
  //             });

  //             // Отправляем подтверждение пользователю
  //             await bot.sendMessage(
  //               chatId,
  //               "Дякуємо за ваше повідомлення! Наш менеджер зв'яжеться з вами найближчим часом."
  //             );

  //             // Рассчитываем дедлайн (прибавляем 1 рабочий день)
  //             const currentDate = new Date(); // Текущая дата
  //             const deadlineDate = addBusinessDays(currentDate, 1); // Прибавляем 1 рабочий день

  //             // Форматируем дедлайн в нужный формат для Bitrix24 (например, 2024-12-01T18:00:00+03:00)
  //             const formattedDeadline = format(
  //               deadlineDate,
  //               "yyyy-MM-dd'T'HH:mm:ssXXX",
  //               { locale: uk }
  //             );

  //             // Теперь создаем задачу в Bitrix24
  //             const taskData = {
  //               fields: {
  //                 TITLE: "Запит клієнта: " + first_name + " " + (last_name || ""),
  //                 DESCRIPTION: adminMessage, // Содержимое сообщения из Telegram
  //                 RESPONSIBLE_ID: BITRIX24_SERVICE_RESPONSIBLE_ID, // ID исполнителя
  //                 DEADLINE: formattedDeadline, // Дедлайн с учетом +1 рабочего дня
  //                 GROUP_ID: BITRIX24_SERVICE_GROUP_ID, // ID группы
  //                 PRIORITY: 2, // Приоритет
  //               },
  //             };

  //             // Отправляем POST-запрос на создание задачи в Bitrix24
  //             try {
  //               const response = await axios.post(
  //                 BITRIX24_SERVICE_WEBHOOK_URL,
  //                 taskData
  //               );
  //               console.log("Задача создана в Bitrix24:", response.data);
  //             } catch (error) {
  //               console.error("Ошибка при создании задачи в Bitrix24:", error);
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
};

module.exports = {
  setBotCommands,
};
