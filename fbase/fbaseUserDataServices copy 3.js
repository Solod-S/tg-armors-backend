const {
  checkCurrentDateIsAfterLastPost,
  checkTimeToGenerateArticle,
  checkStartDateToGenerateArticle,
  checkEndTypeToGenerateArticle,
} = require("../utils/dateCheckOperations");
const { db } = require("./fbaseConfig");

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

    // проходимся по пользователям
    for (const userDoc of usersSnapshot.docs) {
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
      // console.log(`tgGroupsData`, tgGroupsData);
      const projectIntegrationFBArr = [];
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
            .limit(40)
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

        const { integrations } = projectData;

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
                  schedule.endDate ? schedule.endDate : null
                ):
                const oncePerDaysSchedulePosts = await getPosts(schedule.id);

                if (oncePerDaysSchedulePosts.length <= 0) {
                  const { img, message } = schedule;
                  result.push({ chatId, img, message });
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
                    const { img, message } = schedule;
                    result.push({ chatId, img, message });
                  }
                }
                break;

              default:
                break;
            }
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error getting firebase schedule data:", error);
    throw error;
  }
};

module.exports = fbaseUserDataServices;
