const dotenv = require("dotenv");
const moment = require("moment");
const {
  parse,
  isWithinInterval,
  addMinutes,
  format,
  differenceInMinutes,
  parseISO,
  isValid,
} = require("date-fns");
const { ru } = require("date-fns/locale");
const { db } = require("../fbase/fbaseConfig");
const {
  checkCurrentDateIsAfterLastPost,
  checkTimeToGenerateArticle,
  checkStartDateToGenerateArticle,
  checkEndTypeToGenerateArticle,
  checkMonthlyPublicationDateHasArrived,
} = require("./dateCheckOperations");
const fbaseUserDataServices = require("../fbase/fbaseUserDataServices");
const {
  refreshGoogleCalendarAccessToken,
  getGoogleCalendarEvents,
  getGoogleTasks,
} = require("../utils/googleCalendarOperations");
const {
  getGoogleSheet,
  googleSheetTransformer,
} = require("./googleSHeetsOperations");

dotenv.config();
const { GOOGLE_SHEET_ID } = process.env;

const googleSheetCronEventCheck = async () => {
  const result = [];
  try {
    const data = await getGoogleSheet(GOOGLE_SHEET_ID);

    if (data && data.values && data.values.length > 0) {
      const tasks = googleSheetTransformer(data.values);

      const now = new Date();
      const dayOfWeek = format(now, "EEEE", { locale: ru }).toLowerCase();

      const daysOfWeekMap = {
        понедельник: "Mon",
        вторник: "Tue",
        среда: "Wed",
        четверг: "Thu",
        пятница: "Fri",
        суббота: "Sat",
        воскресенье: "Sun",
      };

      for (const task of tasks) {
        let taskDateTime;
        if (task.date.trim() === "*") {
          const todayDateStr = format(now, "dd.MM.yyyy");
          taskDateTime = parse(
            `${todayDateStr} ${task.time}`,
            "dd.MM.yyyy HH:mm",
            new Date()
          );
        } else if (
          Object.keys(daysOfWeekMap).some(day =>
            task.date.toLowerCase().includes(day)
          )
        ) {
          const taskDay = task.date.toLowerCase();
          if (taskDay.includes(dayOfWeek)) {
            const todayDateStr = format(now, "dd.MM.yyyy");
            taskDateTime = parse(
              `${todayDateStr} ${task.time}`,
              "dd.MM.yyyy HH:mm",
              new Date()
            );
          } else {
            continue;
          }
        } else {
          taskDateTime = parse(
            `${task.date} ${task.time}`,
            "dd.MM.yyyy HH:mm",
            new Date()
          );
        }

        if (!isNaN(taskDateTime)) {
          const intervalStart = addMinutes(taskDateTime, -15);
          const intervalEnd = addMinutes(taskDateTime, 15);

          if (
            isWithinInterval(now, { start: intervalStart, end: intervalEnd })
          ) {
            result.push(task);
          }
        }
      }
    }
    return result;
  } catch (error) {
    console.log(`Error in google sheet cron event check: ${error}`);
    return result;
  }
};

const googleCalendarCronEventCheck = async () => {
  const result = [];
  try {
    const userData = await fbaseUserDataServices.getUsersData();

    if (userData.length <= 0) return result;

    for (const user of userData) {
      for (const project of user.projectsData) {
        const { chatId } = user.tgGroupsData.find(
          chatData => chatData.id === project.tgGroup
        );

        const googleCalendarIntegration = project.integrations.find(
          integration => integration.name === "Google Calendar"
        );

        if (
          !googleCalendarIntegration ||
          !googleCalendarIntegration.credentials ||
          !googleCalendarIntegration.credentials.refresh_token ||
          googleCalendarIntegration.tgSelectors.length <= 0 ||
          !googleCalendarIntegration.active
        )
          continue;

        const refreshToken =
          googleCalendarIntegration.credentials.refresh_token;

        const updatedRefreshToken = await refreshGoogleCalendarAccessToken(
          refreshToken
        );

        if (!updatedRefreshToken) continue;

        const events = await getGoogleCalendarEvents(updatedRefreshToken);

        for (const event of events) {
          if (
            !event.start ||
            !event.start.dateTime ||
            !event.description ||
            !event.summary
          )
            continue;

          const startDateTime = parseISO(event.start.dateTime);
          const description = event.description;

          if (!isValid(startDateTime)) continue;

          const now = new Date();

          // GMT +3
          const kievNowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

          const timeDifference = differenceInMinutes(
            startDateTime,
            kievNowTime
          ); // разница во времени в минутах
          const containsSelector = title => {
            return googleCalendarIntegration.tgSelectors.some(selector =>
              title.includes(selector)
            );
          };

          if (
            Math.abs(timeDifference) <= 10 &&
            containsSelector(event.summary)
          ) {
            result.push({ text: description, chatId });
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error getting google calendar cron event check:", error);
    return result;
  }
};

const firebaseSchedyleEventCheck = async () => {
  const result = [];
  try {
    const usersSnapshot = await db.collection("users").get();

    // проходимся по пользователям
    for (const userDoc of usersSnapshot.docs) {
      const { owner_uid, email } = userDoc.data();

      const tgGroupsDataRef = userDoc.ref.collection("project-tg-groups");
      const tgGroupsDataSnapshot = await tgGroupsDataRef.get();
      const tgGroupsData = [];

      tgGroupsDataSnapshot.forEach(tgDoc => {
        const tgData = tgDoc.data();
        tgGroupsData.push({
          ...tgData,
        });
      });
      if (tgGroupsData.length <= 0) continue;

      const projectsSnapshot = await userDoc.ref
        .collection("projectsData")
        .where("active", "==", true)
        .where("integrations", ">", [])
        .get();

      // проходимся по проектам
      for (const projectDoc of projectsSnapshot.docs) {
        const getPostsLength = async id => {
          const articlesRef = projectDoc.ref
            .collection("firebaseShedulePosts")
            .where("scheduleId", "==", id);

          const articlesSnapshot = await articlesRef.get();

          const articlesLength = articlesSnapshot.size;
          return articlesLength;
        };

        const getPosts = async id => {
          const articlesRef = projectDoc.ref
            .collection("firebaseShedulePosts")
            .where("scheduleId", "==", id);

          const articlesSnapshot = await articlesRef
            .orderBy("dateCreated", "desc")
            .limit(10)
            .get();

          const articlesArray = articlesSnapshot.docs.map(articleDoc =>
            articleDoc.data()
          );

          return articlesArray;
        };

        const projectData = projectDoc.data();
        if (
          (projectData.tgGroup && !projectData.tgGroup.length > 0) ||
          !projectData.tgGroup
        )
          continue;

        let chatId = null;
        if (Array.isArray(tgGroupsData)) {
          chatId = tgGroupsData.find(
            group => group.id === projectData.tgGroup
          ).chatId;
        }
        if (!chatId) continue;

        const { integrations, projectId } = projectData;

        // Фильтруем integrations
        const integrationsData = integrations.filter(
          integration =>
            integration.name === "Firebase Schedule" &&
            integration.active === true &&
            integration.scheduleData &&
            integration.scheduleData.length > 0
        );

        // проходимся по фаербейс интеграциям
        for (const integration of integrationsData) {
          const scheduleData = integration.scheduleData.filter(
            schedule => schedule.status
          );

          for (const schedule of scheduleData) {
            switch (true) {
              // FOR PER DAY GENERATING ONLY
              case schedule.generationIntervalType === "oncePerDays" &&
                checkTimeToGenerateArticle(schedule.selectedTime) &&
                checkStartDateToGenerateArticle(schedule.startDate) &&
                checkEndTypeToGenerateArticle(
                  schedule.repeatEndType,
                  schedule.endDate ? schedule.endDate : null,
                  await getPostsLength(schedule.id)
                ):
                const oncePerDaysSchedulePosts = await getPosts(schedule.id);

                if (oncePerDaysSchedulePosts.length <= 0) {
                  const { img, message, id, name } = schedule;
                  result.push({
                    owner_uid,
                    projectId,
                    email,
                    chatId,
                    img,
                    video: schedule.video,
                    text: message,
                    scheduleId: id,
                    scheduleName: name,
                  });
                } else {
                  let lastPostDate = null;

                  oncePerDaysSchedulePosts.forEach(postsData => {
                    const { dateCreated } = postsData;

                    if (!lastPostDate) {
                      lastPostDate = dateCreated;
                    }
                  });
                  let needToGenerateOncePerDaysPost = false;

                  if (lastPostDate) {
                    if (
                      checkCurrentDateIsAfterLastPost(lastPostDate.toDate())
                    ) {
                      needToGenerateOncePerDaysPost = true;
                    }
                  } else {
                    needToGenerateOncePerDaysPost = true;
                  }

                  if (needToGenerateOncePerDaysPost) {
                    const { img, message, id, name } = schedule;
                    result.push({
                      owner_uid,
                      projectId,
                      email,
                      chatId,
                      img,
                      video: schedule.video,
                      text: message,
                      scheduleId: id,
                      scheduleName: name,
                    });
                  }
                }
                break;
              // FOR WEEKLY GENERATING ONLY
              case schedule.generationIntervalType === "weekly" &&
                checkTimeToGenerateArticle(schedule.selectedTime) &&
                checkStartDateToGenerateArticle(schedule.startDate) &&
                checkEndTypeToGenerateArticle(
                  schedule.repeatEndType,
                  schedule.endDate ? schedule.endDate : null,
                  await getPostsLength(schedule.id)
                ):
                let currentDate = new Date();

                let currentDay = currentDate.getDay();
                let daysOfWeekText = [
                  "sunday",
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                ];

                currentDay = daysOfWeekText[currentDay];
                const dayOfWeek = moment(schedule.startDate)
                  .format("dddd")
                  .toLowerCase();
                const weeklySchedulePosts = await getPosts(schedule.id);
                let lastPostDate = null;

                weeklySchedulePosts.forEach(postsData => {
                  const { dateCreated } = postsData;

                  if (!lastPostDate) {
                    lastPostDate = dateCreated;
                  }
                });

                const needToGenerateWeeklyPosts =
                  currentDay === dayOfWeek &&
                  (weeklySchedulePosts.length === 0 ||
                    lastPostDate === null ||
                    (lastPostDate &&
                      lastPostDate.toDate().getFullYear() !==
                        currentDate.getFullYear()) ||
                    lastPostDate.toDate().getMonth() !==
                      currentDate.getMonth() ||
                    lastPostDate.toDate().getDate() !== currentDate.getDate());

                if (needToGenerateWeeklyPosts) {
                  const { img, message, id, name } = schedule;
                  result.push({
                    owner_uid,
                    projectId,
                    email,
                    chatId,
                    img,
                    video: schedule.video,
                    text: message,
                    scheduleId: id,
                    scheduleName: name,
                  });
                }
                break;

              // FOR MONTHLY GENERATING ONLY
              case schedule.generationIntervalType === "monthly" &&
                checkTimeToGenerateArticle(schedule.selectedTime) &&
                checkStartDateToGenerateArticle(schedule.startDate) &&
                checkMonthlyPublicationDateHasArrived(
                  schedule.startDate,
                  schedule.monthlyIntervalLastDay
                ) &&
                checkEndTypeToGenerateArticle(
                  schedule.repeatEndType,
                  schedule.endDate ? schedule.endDate : null,
                  await getPostsLength(schedule.id)
                ):
                const currentMonthDate = new Date();
                let lastMonthlyPostDate = null;

                let monthlyPosts = await getPosts(schedule.id);

                monthlyPosts.forEach(postsData => {
                  const { dateCreated } = postsData;

                  if (!lastMonthlyPostDate) {
                    lastMonthlyPostDate = dateCreated;
                  }
                });

                const needToGenerateMonthlyArticle =
                  monthlyPosts.length === 0 ||
                  lastMonthlyPostDate === null ||
                  (lastMonthlyPostDate &&
                    lastMonthlyPostDate.toDate().getFullYear() !==
                      currentMonthDate.getFullYear()) ||
                  lastMonthlyPostDate.toDate().getMonth() !==
                    currentMonthDate.getMonth() ||
                  lastMonthlyPostDate.toDate().getDate() !==
                    currentMonthDate.getDate();

                if (needToGenerateMonthlyArticle) {
                  const { img, message, id, name } = schedule;
                  result.push({
                    owner_uid,
                    projectId,
                    email,
                    chatId,
                    img,
                    video: schedule.video,
                    text: message,
                    scheduleId: id,
                    scheduleName: name,
                  });
                }

                break;

              default:
                break;
            }
          }
        }
      }
    }
    console.log(`result`, result);
    return result;
  } catch (error) {
    console.error("Error getting firebase schedyle event check:", error);
    return result;
  }
};

module.exports = {
  googleSheetCronEventCheck,
  googleCalendarCronEventCheck,
  firebaseSchedyleEventCheck,
};
