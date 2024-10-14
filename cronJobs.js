const cron = require("node-cron");
const axios = require("axios");
const { endOfMonth, isWeekend, subDays, isSameDay } = require("date-fns");
const bot = require("./app");
const {
  googleSheetCronEventCheck,
  googleCalendarCronEventCheck,
  firebaseSchedyleEventCheck,
} = require("./utils/cronOperations");
const {
  escapeMarkdown,
  getRandomGreeting,
  finalFormatText,
  formatText,
  isImageUrl,
} = require("./utils/helpers");
const { cron1cMessageText } = require("./constant/messages");
const { chatId, cronStickerUrl } = require("./config");
const fbaseUserDataServices = require("./fbase/fbaseUserDataServices");

const scheduleCronJobs = () => {
  // Расписание каждый 30 мин ходить в гугл календарь
  cron.schedule("*/30 * * * *", async () => {
    try {
      console.log(
        `* Расписание каждый 30 мин ходить в гугл календарь:`,
        new Date().toLocaleString()
      );
      const tasks = await googleCalendarCronEventCheck();
      console.log(`current google calendar tasks:`, tasks);

      if (tasks.length > 0) {
        for (const task of tasks) {
          const fullSet = task.chatId && task.text;
          if (fullSet) {
            const chatId = task.chatId;
            const text = task.text.trim();
            const formattedText = formatText(text); // Форматирование текста
            const escapedText = finalFormatText(formattedText);

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

  // Расписание каждый час ходить в фаер бейс
  cron.schedule("0 * * * *", async () => {
    try {
      console.log(
        `* Расписание каждый час ходить в фаер бейс:`,
        new Date().toLocaleString()
      );
      const tasks = await firebaseSchedyleEventCheck();
      console.log(`current fireBase tasks:`, tasks);

      if (tasks.length > 0) {
        for (const task of tasks) {
          const fullSet = task.chatId && task.text;
          if (fullSet) {
            const chatId = task.chatId;
            const text = task.text.trim();
            const escapedText = escapeMarkdown(text);

            try {
              let validImages = [];
              if (task.img && task.img.length > 0) {
                // Проверяем каждую ссылку на изображение
                const imageCheckPromises = await task.img.map(url =>
                  isImageUrl(url)
                );

                const imageCheckResults = await Promise.all(imageCheckPromises);

                // Фильтруем только рабочие ссылки
                validImages = task.img.filter(
                  (url, index) => imageCheckResults[index]
                );
              }

              if (validImages.length > 0) {
                const media = validImages.map((url, index) => ({
                  type: "photo",
                  media: url,
                  caption: index === 0 ? escapedText : "",
                  parse_mode: "MarkdownV2",
                }));

                await bot.sendMediaGroup(chatId, media);
              } else {
                // Если нет валидных изображений, отправляем только текст
                await bot.sendMessage(chatId, escapedText, {
                  parse_mode: "MarkdownV2",
                });
              }

              await fbaseUserDataServices.addSchedulePost(task);
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

  // Расписание каждый час ходить в гугл таблицу
  cron.schedule("0 * * * *", async () => {
    try {
      console.log(
        `* Расписание каждый час ходить в гугл таблицу:`,
        new Date().toLocaleString()
      );
      const tasks = await googleSheetCronEventCheck();
      console.log(`current google sheet's tasks:`, tasks);

      if (tasks.length > 0) {
        for (const task of tasks) {
          const fullSet = task.chatId && task.text;
          if (fullSet) {
            const chatId = task.chatId;
            const text = task.text.trim();
            const escapedText = escapeMarkdown(text);

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

  // Расписание для отправки напоминания выйти из 1с в конце месяца
  cron.schedule("0 19 * * *", () => {
    try {
      console.log(
        `* Расписание для отправки напоминания выйти из 1с в конце месяца:`,
        new Date().toLocaleString()
      );
      const currentDate = new Date();
      const lastDayOfMonth = endOfMonth(currentDate);

      if (isSameDay(currentDate, lastDayOfMonth)) {
        bot.sendAnimation(chatId, cronStickerUrl, {
          caption: cron1cMessageText,
          parse_mode: "Markdown",
        });
      }
    } catch (error) {
      console.log(
        `Error in reminder 1s exit cron (last day of the month): ${error}`
      );
    }
  });

  // Расписание для отправки напоминания выйти из 1с в последний рабочий день месяц
  cron.schedule("0 18 * * *", () => {
    try {
      console.log(
        `* Расписание для отправки напоминания выйти из 1с в последний рабочий день месяц:`,
        new Date().toLocaleString()
      );
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
    } catch (error) {
      console.log(`Error in reminder 1s exit cron: ${error}`);
    }
  });

  // Расписание для отправки приветствий в будние дни в 9:00 утра (понедельник-пятница)
  cron.schedule("0 9 * * 1-5", () => {
    try {
      console.log(
        `* Расписание для отправки приветствий в будние дни в 9:00 утра (понедельник-пятница):`,
        new Date().toLocaleString()
      );
      bot.sendMessage(chatId, getRandomGreeting(), {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.log(`Error in weekday greetings: ${error}`);
    }
  });
};

module.exports = {
  scheduleCronJobs,
};

const test = async () => {
  // try {
  //   console.log(
  //     `* Расписание каждый час ходить в фаер бейс:`,
  //     new Date().toLocaleString()
  //   );
  //   const tasks = await firebaseSchedyleEventCheck();
  //   console.log(`current fireBase tasks:`, tasks);
  //   if (tasks.length > 0) {
  //     for (const task of tasks) {
  //       const fullSet = task.chatId && task.text;
  //       if (fullSet) {
  //         const chatId = task.chatId;
  //         const text = task.text.trim();
  //         const escapedText = escapeMarkdown(text);
  //         try {
  //           let validImages = [];
  //           if (task.img && task.img.length > 0) {
  //             // Проверяем каждую ссылку на изображение
  //             const imageCheckPromises = await task.img.map(url =>
  //               isImageUrl(url)
  //             );
  //             const imageCheckResults = await Promise.all(imageCheckPromises);
  //             // Фильтруем только рабочие ссылки
  //             validImages = task.img.filter(
  //               (url, index) => imageCheckResults[index]
  //             );
  //           }
  //           if (validImages.length > 0) {
  //             const media = validImages.map((url, index) => ({
  //               type: "photo",
  //               media: url,
  //               caption: index === 0 ? escapedText : "",
  //               parse_mode: "MarkdownV2",
  //             }));
  //             await bot.sendMediaGroup(chatId, media);
  //           } else {
  //             // Если нет валидных изображений, отправляем только текст
  //             await bot.sendMessage(chatId, escapedText, {
  //               parse_mode: "MarkdownV2",
  //             });
  //           }
  //           await fbaseUserDataServices.addSchedulePost(task);
  //         } catch (sendError) {
  //           console.log(`Error sending message to ${chatId}: ${sendError}`);
  //         }
  //       }
  //     }
  //   }
  // } catch (error) {
  //   console.log(`Error in google sheet cron: ${error}`);
  // }
};

test();
