const { db } = require("./fbaseConfig");
const moment = require("moment");

function checkDateToGenerateArticle(date) {
  const lastPublicationDate = moment(date);
  const currentDate = moment();
  if (currentDate.isAfter(lastPublicationDate, "day")) {
    return true;
  }
  return false;
}

function checkTimeToGenerateArticle(inputTime) {
  // Split the time string into hours and minutes
  const [hours, minutes] = inputTime.split(":").map(Number);

  // Get the current time
  const currentTime = new Date();
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  if (
    currentHours > hours ||
    (currentHours === hours && currentMinutes >= minutes)
  ) {
    return true;
  } else {
    return false;
  }
}

function checkStartDateToGenerateArticle(inputDate) {
  const startDateIsOk = moment().isSameOrAfter(moment(inputDate), "day");

  if (startDateIsOk) {
    return true;
  } else {
    return false;
  }
}

function checkEndTypeToGenerateArticle(
  repeatEndType,
  repeatEndValue,
  currentContentLenght
) {
  switch (true) {
    case repeatEndType === "date":
      const endDateHasPassed = moment().isAfter(moment(repeatEndValue), "day");

      if (endDateHasPassed) {
        return false;
      } else {
        return true;
      }

    case repeatEndType === "attempts":
      if (repeatEndValue > currentContentLenght) {
        return true;
      } else {
        return false;
      }

    default:
      return true;
  }
}




const fbaseUserDataServices = {};

fbaseUserDataServices.getUsersData = async () => {
  try {
    const usersRef = db.collection("users");
    const usersSnapshot = await usersRef.get();

    const allUserData = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = {
        id: userId,
        ...userDoc.data(),
        projectsData: [],
        projectCategories: [],
        tgGroupsData: [],
      };

      // Get projectsData subcollection
      const projectsDataRef = userDoc.ref.collection("projectsData");
      const tgGroupsDataRef = userDoc.ref.collection("project-tg-groups");
      const projectsDataSnapshot = await projectsDataRef.get();
      const tgGroupsDataSnapshot = await tgGroupsDataRef.get();

      projectsDataSnapshot.forEach(projectDoc => {
        const projectData = projectDoc.data();

        if (
          projectData.active &&
          projectData.tgGroup &&
          projectData.tgGroup.length > 0 &&
          projectData.integrations &&
          projectData.integrations.find(
            integrations =>
              integrations.active &&
              integrations.name === "Google Calendar" &&
              integrations.tgSelectors &&
              integrations.tgSelectors.length > 0
          )
        ) {
          userData.projectsData.push({
            id: projectDoc.id,
            ...projectData,
          });
        }
      });

      tgGroupsDataSnapshot.forEach(tgDoc => {
        const tgData = tgDoc.data();
        userData.tgGroupsData.push({
          ...tgData,
        });
      });

      // Get project-categories subcollection
      const projectCategoriesRef = userDoc.ref.collection("project-categories");
      const projectCategoriesSnapshot = await projectCategoriesRef.get();

      projectCategoriesSnapshot.forEach(categoryDoc => {
        const categoryData = categoryDoc.data();
        userData.projectCategories.push({
          id: categoryDoc.id,
          ...categoryData,
        });
      });

      if (userData.projectsData.length > 0) {
        allUserData.push(userData);
      }
    }

    return allUserData;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

fbaseUserDataServices.getFireBaseScheduling = async () => {
  try {
    const usersSnapshot = await db.collection("users").get();

    const result = [];

    for (const userDoc of usersSnapshot.docs) {
      // const tgGroupsDataRef = userDoc.ref.collection("project-tg-groups");
      // const tgGroupsDataSnapshot = await tgGroupsDataRef.get();
      const projectIntegrationFBArr = [];
      const projectsSnapshot = await userDoc.ref
        .collection("projectsData")
        .where("active", "==", true)
        .where("integrations", ">", [])
        .get();

      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();
        if (projectData.tgGroup && !projectData.tgGroup.length > 0) return;
        const chatId = projectData.tgGroup;

        const { integrations } = projectData;

        // Фильтруем integrations
        const hasTargetIntegration = integrations.some(
          integration =>
            integration.name === "Firebase Schedule" &&
            integration.active === true &&
            integration.scheduleData &&
            integration.scheduleData.length > 0
        );

        if (!hasTargetIntegration) return;

        const integrationsData = integrations.filter(
          integration =>
            integration.name === "Firebase Schedule" &&
            integration.active === true &&
            integration.scheduleData &&
            integration.scheduleData.length > 0
        );

        console.log(`integrationsData`, integrationsData);

        for (const integration of integrationsData) {
          const scheduleData = integration.scheduleData.filter(
            schedule => schedule.status
          );
          console.log(`scheduleData`, scheduleData);

          for (const schedule of scheduleData) {
            switch (true) {
              // FOR PER DAY GENERATING ONLY

              case schedule.generationIntervalType === "oncePerDays" &&
                active &&
                checkTimeToGenerateArticle(schedule.selectedTime) &&
                checkStartDateToGenerateArticle(
                  schedule.generationIntervalTypeValue
                ) &&
                checkEndTypeToGenerateArticle(
                  schedule.repeatEndType,
                  schedule.repeatEndValue ? schedule.repeatEndValue : null
                ):

                const oncePerDaysArticles = await getArticles(id);

                if (oncePerDaysArticles.length <= 0) {
                  result.push({
                    user: userDoc.id,
                    userEmail: email,
                    userDoc,

                    project: projectDoc.id,
                    site,
                    name,
                    projectSubjects: projectSubject,
                    categoryIds,
                    mediaCategory,
                    mediaSource,
                    wikipediaCommons,
                    dalleStyle,
                    aiEngine,
                    aIContentDirective,
                    tone,
                    topicDescriptors,
                    faq_option,
                    draft,
                    imageOrientation,
                    imageFormat,
                    postTemplate,
                    linkToSource,
                    imageQuality,
                    imageResolution,
                    socialData,
                    subjectId: id,
                    articleLinks: [],
                    articleTitles: [],
                    articleImages: [],
                  });
                } else {
                  let lastArticleDate = null;
                  const articleTitles = [];
                  const articleLinks = [];
                  const articleImages = [];

                  oncePerDaysArticles.forEach(articleData => {
                    const {
                      originalLink,
                      originalTitle,
                      dateCreated,
                      imgInfo,
                      generateOnDemand = false,
                    } = articleData;

                    if (originalTitle) {
                      articleTitles.push(originalTitle);
                    }

                    if (imgInfo) {
                      articleImages.push(imgInfo);
                    }

                    if (originalLink) {
                      articleLinks.push(originalLink);
                    }

                    if (generateOnDemand) {
                      return;
                    }

                    if (!lastArticleDate) {
                      lastArticleDate = dateCreated;
                    }
                  });

                  let needToGenerateOncePerDaysArticle = false;

                  if (lastArticleDate) {
                    if (checkDateToGenerateArticle(lastArticleDate.toDate())) {
                      needToGenerateOncePerDaysArticle = true;
                    }
                  } else {
                    needToGenerateOncePerDaysArticle = true;
                  }
                  // console.log(projectDoc.id, userDoc.id);
                  needToGenerateOncePerDaysArticle &&
                    result.push({
                      user: userDoc.id,
                      userEmail: email,
                      userDoc,

                      project: projectDoc.id,
                      site,
                      name,
                      projectSubjects: projectSubject,
                      categoryIds,
                      mediaCategory,
                      mediaSource,
                      wikipediaCommons,
                      dalleStyle,
                      aiEngine,
                      aIContentDirective,
                      tone,
                      topicDescriptors,
                      faq_option,
                      draft,
                      imageOrientation,
                      imageFormat,
                      postTemplate,
                      linkToSource,
                      imageQuality,
                      imageResolution,
                      socialData,
                      subjectId: id,
                      articleLinks,
                      articleTitles,
                      articleImages,
                    });
               
                break;

              // FOR WEEKLY GENERATING ONLY
              case schedule.generationIntervalType === "weekly" &&
                active &&
                checkTimeToGenerateArticle(schedule.selectedTime) &&
                checkStartDateToGenerateArticle(
                  schedule.generationIntervalTypeValue
                ) &&
                checkEndTypeToGenerateArticle(
                  schedule.repeatEndType,
                  repeatEndValue
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
                const dayOfWeek = moment(generationIntervalTypeValue)
                  .format("dddd")
                  .toLowerCase();
                let weeklyArticles = await getArticles(id);
                let lastArticleDate = null;
                const articleTitles = [];
                const articleLinks = [];
                const articleImages = [];

                weeklyArticles.forEach(articleData => {
                  const {
                    dateCreated,
                    originalLink,
                    originalTitle,
                    imgInfo,
                    generateOnDemand = false,
                  } = articleData;
                  if (originalTitle) {
                    articleTitles.push(originalTitle);
                  }

                  if (originalLink) {
                    articleLinks.push(originalLink);
                  }

                  if (imgInfo) {
                    articleImages.push(imgInfo);
                  }
                  if (generateOnDemand) {
                    return;
                  }
                  if (!lastArticleDate) {
                    lastArticleDate = dateCreated;
                  }
                });

                const needToGenerateWeeklyArticle =
                  currentDay === dayOfWeek &&
                  (weeklyArticles.length === 0 ||
                    lastArticleDate === null ||
                    (lastArticleDate &&
                      lastArticleDate.toDate().getFullYear() !==
                        currentDate.getFullYear()) ||
                    lastArticleDate.toDate().getMonth() !==
                      currentDate.getMonth() ||
                    lastArticleDate.toDate().getDate() !==
                      currentDate.getDate());

                if (needToGenerateWeeklyArticle) {
                  if (weeklyArticles.length <= 0) {
                    result.push({
                      user: userDoc.id,
                      userEmail: email,
                      userDoc,

                      project: projectDoc.id,
                      site,
                      name,
                      projectSubjects: projectSubject,
                      categoryIds,
                      mediaCategory,
                      mediaSource,
                      wikipediaCommons,
                      dalleStyle,
                      aiEngine,
                      aIContentDirective,
                      tone,
                      topicDescriptors,
                      faq_option,
                      draft,
                      imageOrientation,
                      imageFormat,
                      postTemplate,
                      linkToSource,
                      imageQuality,
                      imageResolution,
                      socialData,
                      subjectId: id,
                      articleLinks,
                      articleTitles,
                      articleImages,
                    });
                  } else {
                    result.push({
                      user: userDoc.id,
                      userEmail: email,
                      userDoc,

                      project: projectDoc.id,
                      site,
                      name,
                      projectSubjects: projectSubject,
                      categoryIds,
                      mediaCategory,
                      mediaSource,
                      wikipediaCommons,
                      dalleStyle,
                      aiEngine,
                      aIContentDirective,
                      tone,
                      topicDescriptors,
                      faq_option,
                      draft,
                      imageOrientation,
                      imageFormat,
                      postTemplate,
                      linkToSource,
                      imageQuality,
                      imageResolution,
                      socialData,
                      subjectId: id,
                      articleLinks,
                      articleTitles,
                      articleImages,
                    });
                  }
                }
                break;

              // FOR MONTHLY GENERATING ONLY
              case schedule.generationIntervalType === "monthly" &&
                active &&
                checkTimeToGenerateArticle(schedule.selectedTime) &&
                checkStartDateToGenerateArticle(generationIntervalTypeValue) &&
                checkMonthlyPublicationDateHasArrived(
                  generationIntervalTypeValue,
                  monthlyIntervalLastDay
                ) &&
                checkEndTypeToGenerateArticle(repeatEndType, repeatEndValue):
                const currentMonthDate = new Date();
                let lastMonthlyArticleDate = null;
                const monthlyArticleTitles = [];
                const monthlyArticleLinks = [];
                const monthlyArticleImages = [];

                let monthlyArticles = await getArticles(id);

                monthlyArticles.forEach(articleData => {
                  const {
                    dateCreated,
                    originalLink,
                    originalTitle,
                    imgInfo,
                    generateOnDemand = false,
                    title,
                  } = articleData;

                  if (originalTitle) {
                    monthlyArticleTitles.push(originalTitle);
                  }

                  if (originalLink) {
                    monthlyArticleLinks.push(originalLink);
                  }

                  if (imgInfo) {
                    monthlyArticleImages.push(imgInfo);
                  }
                  if (generateOnDemand) {
                    return;
                  }

                  if (!lastMonthlyArticleDate) {
                    lastMonthlyArticleDate = dateCreated;
                  }
                });

                const needToGenerateMonthlyArticle =
                  // dayOfMonth === monthlyDayType &&
                  monthlyArticles.length === 0 ||
                  lastMonthlyArticleDate === null ||
                  (lastMonthlyArticleDate &&
                    lastMonthlyArticleDate.toDate().getFullYear() !==
                      currentMonthDate.getFullYear()) ||
                  lastMonthlyArticleDate.toDate().getMonth() !==
                    currentMonthDate.getMonth() ||
                  lastMonthlyArticleDate.toDate().getDate() !==
                    currentMonthDate.getDate();

                if (needToGenerateMonthlyArticle) {
                  result.push({
                    user: userDoc.id,
                    userEmail: email,
                    userDoc,

                    project: projectDoc.id,
                    site,
                    name,
                    projectSubjects: projectSubject,
                    categoryIds,
                    mediaCategory,
                    mediaSource,
                    wikipediaCommons,
                    dalleStyle,
                    aiEngine,
                    aIContentDirective,
                    tone,
                    topicDescriptors,
                    faq_option,
                    draft,
                    imageOrientation,
                    imageFormat,
                    postTemplate,
                    linkToSource,
                    imageQuality,
                    imageResolution,
                    socialData,
                    subjectId: id,
                    articleLinks: monthlyArticleLinks,
                    articleTitles: monthlyArticleTitles,
                    articleImages: monthlyArticleImages,
                  });
                }

                break;

              default:
                break;
            }
          }
        }

        if (hasTargetIntegration) {
          projectIntegrationFBArr.push(projectData);
        }
      }
      // console.log(`projectIntegrationFBArr`, projectIntegrationFBArr);

      // const { email } = userDoc.data();
      // for (const projectDoc of projectsSnapshot.docs) {
      //   const { projectContentGenerationData, site, name, socialData } =
      //     projectDoc.data();

      //   const getArticles = async id => {
      //     const articlesRef = projectDoc.ref
      //       .collection("articles")
      //       .where("subjectId", "==", id);

      //     const articlesSnapshot = await articlesRef
      //       .orderBy("dateCreated", "desc")
      //       .limit(40)
      //       .get();

      //     const articlesArray = articlesSnapshot.docs.map(articleDoc =>
      //       articleDoc.data()
      //     );

      //     return articlesArray;
      //   };

      //   const getArticlesLength = async id => {
      //     const articlesRef = projectDoc.ref
      //       .collection("articles")
      //       .where("subjectId", "==", id);

      //     const articlesSnapshot = await articlesRef.get();

      //     const articlesLength = articlesSnapshot.size;
      //     return articlesLength;
      //   };

      //   // OLD VERSION
      //   // const projectHasActiveQuery = projectContentGenerationData.some(
      //   //   obj => obj.active === true

      //   const projectHasActiveQuery = projectContentGenerationData.filter(
      //     obj => obj.active === true
      //   );
      //   // subjectId === id
      //   if (projectHasActiveQuery.length > 0) {
      //     for (const queryNewsParams of projectHasActiveQuery) {
      //       const {
      //         generationIntervalType,
      //         generationIntervalTypeValue = null,
      //         repeatEndType = "never",
      //         repeatEndValue = null,
      //         monthlyIntervalLastDay = "disable",
      //         active,
      //         id,
      //         projectSubject,
      //         categoryIds = [],
      //         mediaCategory = "—",
      //         mediaSource = "photobanks",
      //         wikipediaCommons = false,
      //         dalleStyle = "",
      //         aiEngine = "GPT-4o-mini",
      //         draft = false,
      //         aIContentDirective = "",
      //         tone = "—",
      //         topicDescriptors = [],
      //         faq_option = "unchanged",
      //         imageOrientation = "square",
      //         imageFormat = "webp",
      //         postTemplate = "default",
      //         linkToSource = false,
      //         imageQuality = 100,
      //         imageResolution = 1024,
      //         daysFrequency,
      //         // dayOfMonth,
      //         // dayOfWeek,
      //         schedule.selectedTime = "10:00",
      //       } = queryNewsParams;

      //       switch (true) {
      //         // FOR PER DAY GENERATING ONLY

      //         case generationIntervalType === "oncePerDays" &&
      //           active &&
      //           checkTimeToGenerateArticle(schedule.selectedTime) &&
      //           checkStartDateToGenerateArticle(generationIntervalTypeValue) &&
      //           checkEndTypeToGenerateArticle(
      //             repeatEndType,
      //             repeatEndValue,
      //             await getArticlesLength(id)
      //           ):
      //           // const arL = await getArticlesLength(id);
      //           // console.log(`arL`, arL);
      //           const oncePerDaysArticles = await getArticles(id);

      //           if (oncePerDaysArticles.length <= 0) {
      //             result.push({
      //               user: userDoc.id,
      //               userEmail: email,
      //               userDoc,

      //               project: projectDoc.id,
      //               site,
      //               name,
      //               projectSubjects: projectSubject,
      //               categoryIds,
      //               mediaCategory,
      //               mediaSource,
      //               wikipediaCommons,
      //               dalleStyle,
      //               aiEngine,
      //               aIContentDirective,
      //               tone,
      //               topicDescriptors,
      //               faq_option,
      //               draft,
      //               imageOrientation,
      //               imageFormat,
      //               postTemplate,
      //               linkToSource,
      //               imageQuality,
      //               imageResolution,
      //               socialData,
      //               subjectId: id,
      //               articleLinks: [],
      //               articleTitles: [],
      //               articleImages: [],
      //             });
      //           } else {
      //             let lastArticleDate = null;
      //             const articleTitles = [];
      //             const articleLinks = [];
      //             const articleImages = [];

      //             oncePerDaysArticles.forEach(articleData => {
      //               const {
      //                 originalLink,
      //                 originalTitle,
      //                 dateCreated,
      //                 imgInfo,
      //                 generateOnDemand = false,
      //               } = articleData;

      //               if (originalTitle) {
      //                 articleTitles.push(originalTitle);
      //               }

      //               if (imgInfo) {
      //                 articleImages.push(imgInfo);
      //               }

      //               if (originalLink) {
      //                 articleLinks.push(originalLink);
      //               }

      //               if (generateOnDemand) {
      //                 return;
      //               }

      //               if (!lastArticleDate) {
      //                 lastArticleDate = dateCreated;
      //               }
      //             });

      //             let needToGenerateOncePerDaysArticle = false;

      //             if (lastArticleDate) {
      //               if (checkDateToGenerateArticle(lastArticleDate.toDate())) {
      //                 needToGenerateOncePerDaysArticle = true;
      //               }
      //             } else {
      //               needToGenerateOncePerDaysArticle = true;
      //             }
      //             // console.log(projectDoc.id, userDoc.id);
      //             needToGenerateOncePerDaysArticle &&
      //               result.push({
      //                 user: userDoc.id,
      //                 userEmail: email,
      //                 userDoc,

      //                 project: projectDoc.id,
      //                 site,
      //                 name,
      //                 projectSubjects: projectSubject,
      //                 categoryIds,
      //                 mediaCategory,
      //                 mediaSource,
      //                 wikipediaCommons,
      //                 dalleStyle,
      //                 aiEngine,
      //                 aIContentDirective,
      //                 tone,
      //                 topicDescriptors,
      //                 faq_option,
      //                 draft,
      //                 imageOrientation,
      //                 imageFormat,
      //                 postTemplate,
      //                 linkToSource,
      //                 imageQuality,
      //                 imageResolution,
      //                 socialData,
      //                 subjectId: id,
      //                 articleLinks,
      //                 articleTitles,
      //                 articleImages,
      //               });
      //           }
      //           break;

      //         // FOR WEEKLY GENERATING ONLY
      //         case generationIntervalType === "weekly" &&
      //           active &&
      //           checkTimeToGenerateArticle(schedule.selectedTime) &&
      //           checkStartDateToGenerateArticle(generationIntervalTypeValue) &&
      //           checkEndTypeToGenerateArticle(
      //             repeatEndType,
      //             repeatEndValue,
      //             await getArticlesLength(id)
      //           ):
      //           let currentDate = new Date();
      //           let currentDay = currentDate.getDay();
      //           let daysOfWeekText = [
      //             "sunday",
      //             "monday",
      //             "tuesday",
      //             "wednesday",
      //             "thursday",
      //             "friday",
      //             "saturday",
      //           ];

      //           currentDay = daysOfWeekText[currentDay];
      //           const dayOfWeek = moment(generationIntervalTypeValue)
      //             .format("dddd")
      //             .toLowerCase();
      //           let weeklyArticles = await getArticles(id);
      //           let lastArticleDate = null;
      //           const articleTitles = [];
      //           const articleLinks = [];
      //           const articleImages = [];

      //           weeklyArticles.forEach(articleData => {
      //             const {
      //               dateCreated,
      //               originalLink,
      //               originalTitle,
      //               imgInfo,
      //               generateOnDemand = false,
      //             } = articleData;
      //             if (originalTitle) {
      //               articleTitles.push(originalTitle);
      //             }

      //             if (originalLink) {
      //               articleLinks.push(originalLink);
      //             }

      //             if (imgInfo) {
      //               articleImages.push(imgInfo);
      //             }
      //             if (generateOnDemand) {
      //               return;
      //             }
      //             if (!lastArticleDate) {
      //               lastArticleDate = dateCreated;
      //             }
      //           });

      //           const needToGenerateWeeklyArticle =
      //             currentDay === dayOfWeek &&
      //             (weeklyArticles.length === 0 ||
      //               lastArticleDate === null ||
      //               (lastArticleDate &&
      //                 lastArticleDate?.toDate().getFullYear() !==
      //                   currentDate.getFullYear()) ||
      //               lastArticleDate.toDate().getMonth() !==
      //                 currentDate.getMonth() ||
      //               lastArticleDate.toDate().getDate() !==
      //                 currentDate.getDate());

      //           if (needToGenerateWeeklyArticle) {
      //             if (weeklyArticles.length <= 0) {
      //               result.push({
      //                 user: userDoc.id,
      //                 userEmail: email,
      //                 userDoc,

      //                 project: projectDoc.id,
      //                 site,
      //                 name,
      //                 projectSubjects: projectSubject,
      //                 categoryIds,
      //                 mediaCategory,
      //                 mediaSource,
      //                 wikipediaCommons,
      //                 dalleStyle,
      //                 aiEngine,
      //                 aIContentDirective,
      //                 tone,
      //                 topicDescriptors,
      //                 faq_option,
      //                 draft,
      //                 imageOrientation,
      //                 imageFormat,
      //                 postTemplate,
      //                 linkToSource,
      //                 imageQuality,
      //                 imageResolution,
      //                 socialData,
      //                 subjectId: id,
      //                 articleLinks,
      //                 articleTitles,
      //                 articleImages,
      //               });
      //             } else {
      //               result.push({
      //                 user: userDoc.id,
      //                 userEmail: email,
      //                 userDoc,

      //                 project: projectDoc.id,
      //                 site,
      //                 name,
      //                 projectSubjects: projectSubject,
      //                 categoryIds,
      //                 mediaCategory,
      //                 mediaSource,
      //                 wikipediaCommons,
      //                 dalleStyle,
      //                 aiEngine,
      //                 aIContentDirective,
      //                 tone,
      //                 topicDescriptors,
      //                 faq_option,
      //                 draft,
      //                 imageOrientation,
      //                 imageFormat,
      //                 postTemplate,
      //                 linkToSource,
      //                 imageQuality,
      //                 imageResolution,
      //                 socialData,
      //                 subjectId: id,
      //                 articleLinks,
      //                 articleTitles,
      //                 articleImages,
      //               });
      //             }
      //           }
      //           break;

      //         // FOR MONTHLY GENERATING ONLY
      //         case generationIntervalType === "monthly" &&
      //           active &&
      //           checkTimeToGenerateArticle(schedule.selectedTime) &&
      //           checkStartDateToGenerateArticle(generationIntervalTypeValue) &&
      //           checkMonthlyPublicationDateHasArrived(
      //             generationIntervalTypeValue,
      //             monthlyIntervalLastDay
      //           ) &&
      //           checkEndTypeToGenerateArticle(
      //             repeatEndType,
      //             repeatEndValue,
      //             await getArticlesLength(id)
      //           ):
      //           const currentMonthDate = new Date();
      //           let lastMonthlyArticleDate = null;
      //           const monthlyArticleTitles = [];
      //           const monthlyArticleLinks = [];
      //           const monthlyArticleImages = [];

      //           let monthlyArticles = await getArticles(id);

      //           monthlyArticles.forEach(articleData => {
      //             const {
      //               dateCreated,
      //               originalLink,
      //               originalTitle,
      //               imgInfo,
      //               generateOnDemand = false,
      //               title,
      //             } = articleData;

      //             if (originalTitle) {
      //               monthlyArticleTitles.push(originalTitle);
      //             }

      //             if (originalLink) {
      //               monthlyArticleLinks.push(originalLink);
      //             }

      //             if (imgInfo) {
      //               monthlyArticleImages.push(imgInfo);
      //             }
      //             if (generateOnDemand) {
      //               return;
      //             }

      //             if (!lastMonthlyArticleDate) {
      //               lastMonthlyArticleDate = dateCreated;
      //             }
      //           });

      //           const needToGenerateMonthlyArticle =
      //             // dayOfMonth === monthlyDayType &&
      //             monthlyArticles.length === 0 ||
      //             lastMonthlyArticleDate === null ||
      //             (lastMonthlyArticleDate &&
      //               lastMonthlyArticleDate?.toDate().getFullYear() !==
      //                 currentMonthDate.getFullYear()) ||
      //             lastMonthlyArticleDate.toDate().getMonth() !==
      //               currentMonthDate.getMonth() ||
      //             lastMonthlyArticleDate.toDate().getDate() !==
      //               currentMonthDate.getDate();

      //           if (needToGenerateMonthlyArticle) {
      //             result.push({
      //               user: userDoc.id,
      //               userEmail: email,
      //               userDoc,

      //               project: projectDoc.id,
      //               site,
      //               name,
      //               projectSubjects: projectSubject,
      //               categoryIds,
      //               mediaCategory,
      //               mediaSource,
      //               wikipediaCommons,
      //               dalleStyle,
      //               aiEngine,
      //               aIContentDirective,
      //               tone,
      //               topicDescriptors,
      //               faq_option,
      //               draft,
      //               imageOrientation,
      //               imageFormat,
      //               postTemplate,
      //               linkToSource,
      //               imageQuality,
      //               imageResolution,
      //               socialData,
      //               subjectId: id,
      //               articleLinks: monthlyArticleLinks,
      //               articleTitles: monthlyArticleTitles,
      //               articleImages: monthlyArticleImages,
      //             });
      //           }

      //           break;

      //         default:
      //           break;
      //       }
      //     }
      //   }
      // }
    }
    return result;
  } catch (error) {
    console.error("Error getting firebase schedule data:", error);
    throw error;
  }
};

module.exports = fbaseUserDataServices;
