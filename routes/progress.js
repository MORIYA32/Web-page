const express = require("express");
const ProgressController  = require("../controllers/progressController");

const progressController = new ProgressController();
const router = express.Router();

router.post("/", progressController.updateProgress);
router.get("/", progressController.getCurrentProgress);

module.exports = router;
