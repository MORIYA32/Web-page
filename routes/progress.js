const express = require("express");
const ProgressController  = require("../controllers/progressController");

const progressController = new ProgressController();
const router = express.Router();

router.post("/", (req, res) => progressController.updateProgress(req, res));
router.get("/", (req, res) => progressController.getCurrentProgress(req, res));
router.get("/activity", (req, res) => progressController.getProfileActivityByDay(req, res));


module.exports = router;
