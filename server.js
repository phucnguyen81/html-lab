const express = require("express");
const fs = require("fs");
const path = require("path");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const PORT = process.env.PORT || 3000;
const LIVERELOAD_PORT = process.env.LIVERELOAD_PORT || 35729;

const app = express();

// Monkey patch every served HTML so they know of server changes to reload
app.use(connectLivereload({
    port: LIVERELOAD_PORT
}));

// Opens livereload high port, ping browser on Express boot, once browser
// has reconnected and handshaken
const liveReloadServer = livereload.createServer({
    port: LIVERELOAD_PORT
});

liveReloadServer.server.once("connection", () => {
    console.log("LiveReload connected");
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

// Middleware to serve static files
app.use(express.static("."));

// Process each request to return a response
app.get("*", (req, res) => {
    let filePath = path.join(__dirname, "src", req.path);
    const indexFile = path.join(filePath, "index.html");

    // Use index file if it exists
    if (fs.existsSync(indexFile)) {
        filePath = indexFile;
    }

    // Serve the file as text/html
    return fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            res.status(400).send(`${err}`);
            return;
        }

        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
