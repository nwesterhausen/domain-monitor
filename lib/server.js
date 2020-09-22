const express = require('express');
const socketio = require('socket.io');
const morgan = require('morgan');

const app = express();
const http = require('http').createServer(app);
const io = socketio(http);

const path = require('path');

const sockets = require('./sockets');
const configure = require('./configure');
const constants = require('./constants');

const WEB_DIR = path.join(__dirname, "..", "web");

// Logging
app.use(morgan('short'));
// Static Serving
app.use(express.static(WEB_DIR));

io.on('connection', sockets.handler);

function startServer() {
    // Grab most current config settings
    const CONFIG = configure.getConfigObject("config.yaml");
    const RUNNING_PORT = CONFIG.app.port;
    // Run Web Server
    http.listen(RUNNING_PORT, () => {
        console.log(`Web interface available at http://localhost:${RUNNING_PORT}/`);
    });
}

// Restart Server
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
    restartServer
};