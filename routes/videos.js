const express = require("express");
const VideosController  = require("../controllers/videosController");

const videosController = new VideosController();
const router = express.Router();

router.get("/:name", videosController.serveVideo);

module.exports = router;
