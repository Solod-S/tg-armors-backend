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
        // only active google projects

        if (
          projectDoc.data().active &&
          projectDoc.data().tgGroup.length > 0 &&
          projectDoc
            .data()
            .integrations.find(
              integrations =>
                integrations.active &&
                integrations.name === "Google Calendar" &&
                integrations.tgSelectors.length > 0
            )
        )
          userData.projectsData.push({
            id: projectDoc.id,
            ...projectDoc.data(),
          });
      });
      tgGroupsDataSnapshot.forEach(tgDoc => {
        userData.tgGroupsData.push({
          ...tgDoc.data(),
        });
      });

      // Get project-categories subcollection
      const projectCategoriesRef = userDoc.ref.collection("project-categories");
      const projectCategoriesSnapshot = await projectCategoriesRef.get();
      projectCategoriesSnapshot.forEach(categoryDoc => {
        userData.projectCategories.push({
          id: categoryDoc.id,
          ...categoryDoc.data(),
        });
      });

      userData.projectsData.length > 0 && allUserData.push(userData);
    }

    return allUserData;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

module.exports = fbaseUserDataServices;
