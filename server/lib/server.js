const express = require("express");
const socketio = require("socket.io");
const morgan = require("morgan");
const fs = require("fs").promises;

const app = express();
const http = require("http").createServer(app);
const io = socketio(http);

const path = require("path");

const sockets = require("./sockets");
const yamler = require("./yamler");
const constants = require("./constants");

let WEB_DIR = path.join(__dirname, "..", "..", "client", "dist");
if (!require("fs").existsSync(WEB_DIR)) {
  WEB_DIR = path.join(__dirname, "..", "client");
}
console.log(`Serving static site from ${WEB_DIR}`);

// Logging
app.use(morgan("short"));
// Static Serving
app.use(express.static(WEB_DIR));

io.on("connection", sockets.handler);

/**
 * Reads port from config.yaml and starts server listening on that port
 */
function startServer() {
  // Grab most current config settings
  fs.readFile(yamler.CONFIG_YAML_PATH)
    .then(yamler.parseObjectFromYaml)
    .then((config) => {
      const RUNNING_PORT = config.app.port;
      // Run Web Server
      http.listen(RUNNING_PORT, () => {
        console.log(
          `Web interface available at http://localhost:${RUNNING_PORT}/`
        );
      });
    })
    .catch((error) => {
      throw error;
    });
}

/**
 * Closes sockets, stops server and calls startServer()
 */
function restartServer() {
  io.sockets.emit(constants.SCK_SERVER_RESTART);
  io.close();
  http.close(() => {
    console.log("Closed server. Restarting..");

    startServer();
  });
}

module.exports = {
  startServer,
  restartServer,
};
