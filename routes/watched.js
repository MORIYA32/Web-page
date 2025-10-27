const express = require("express");
const WachedController = require("../controllers/watchedController");

const watchedController = new WachedController();
const router = express.Router();

router.post("/", (req, res) => watchedController.markAsWatchedRestApi(req, res));
router.get("/list", (req, res) => watchedController.getWatchedListRestApi(req, res));

module.exports = router;
