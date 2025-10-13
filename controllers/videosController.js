const path = require('path');
const fs = require('fs')

const DUMMY_VIDEO = path.join(__dirname, '..', 'video', "funnydogs.mp4");

class VideosController {
    async serveVideo(req, res) {
        const videoPath = DUMMY_VIDEO;

        if (!fs.existsSync(videoPath)) {
            return res.status(404).send("Video not found");
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;

        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": "video/mp4",
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    };
}

module.exports = VideosController
