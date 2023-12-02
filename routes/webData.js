const webDataRouter = require("express").Router();
const { webData } = require("../controllers");

webDataRouter.post("/", webData.postFormData);

module.exports = webDataRouter;
