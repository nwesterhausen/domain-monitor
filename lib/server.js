const express = require('express');
const socketIO = require('socket.io');
const morgan = require('morgan');

const app = express();
const http = require('http').createServer(app);
const io = socketIO(http);

const path = require('path');

const sockets = require('./sockets');
const configure = require('./configure');
const constants = require('./constants');

const WEB_DIR = path.join(__dirname, '..', 'web');

// Logging
// noinspection JSCheckFunctionSignatures
app.use(morgan('short'));
// Static Serving
app.use(express.static(WEB_DIR));

// noinspection JSUnresolvedFunction
io.on('connection', sockets.handler);

/**
 * Starts the web server
 */
function startServer() {
  // Grab most current config settings
  configure.getObjectFromYaml(configure.CONFIG_YAML_PATH, (err, data) => {
    if (err) throw err;
    const RUNNING_PORT = data.app.port;
    // Run Web Server
    http.listen(RUNNING_PORT, () => {
      console.log(`Web interface available at http://localhost:${RUNNING_PORT}/`);
    });
  });
}

/**
 * Restarts the web server
 */
function restartServer() {
  io.sockets.emit(constants.SCK_SERVER_RESTART);
  io.close();
  http.close(() => {
    console.log('Closed server. Restarting..');

    startServer();
  });
}

module.exports = {
  startServer,
  restartServer,
};
