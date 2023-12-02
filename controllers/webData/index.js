const ctrlWrapper = require("../../middlewares/ctrlWrapper");

const postFormData = require("./postFormData");

module.exports = {
  postFormData: ctrlWrapper(postFormData),
};
