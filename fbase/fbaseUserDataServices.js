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
        ...userDoc.data(), // Включаем данные пользователя
        projectsData: [],
        projectCategories: [],
      };

      // Get projectsData subcollection
      const projectsDataRef = userDoc.ref.collection("projectsData");
      const projectsDataSnapshot = await projectsDataRef.get();
      projectsDataSnapshot.forEach(projectDoc => {
        userData.projectsData.push({ id: projectDoc.id, ...projectDoc.data() });
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

      allUserData.push(userData);
    }

    return allUserData;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

module.exports = fbaseUserDataServices;
