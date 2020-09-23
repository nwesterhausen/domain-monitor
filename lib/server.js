const express = require("express");
const socketio = require("socket.io");
const morgan = require("morgan");

const app = express();
const http = require("http").createServer(app);
const io = socketio(http);

const path = require("path");

const sockets = require("./sockets");
const yamler = require("./yamler");
const constants = require("./constants");

const WEB_DIR = path.join(__dirname, "..", "web");

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
  yamler.getObjectFromYaml(yamler.CONFIG_YAML_PATH, (err, config) => {
    if (err) throw err;
    const RUNNING_PORT = config.app.port;
    // Run Web Server
    http.listen(RUNNING_PORT, () => {
      console.log(
        `Web interface available at http://localhost:${RUNNING_PORT}/`
      );
    });
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
