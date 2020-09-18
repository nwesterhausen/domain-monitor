const express = require('express');
const socketio = require('socket.io');
const morgan = require('morgan');

const app = express();
const http = require('http').createServer(app);
const io = socketio(http);

const path = require('path');
const config = require('config');

const sockets = require('./sockets');
const constants = require('./constants');

const WEB_DIR = path.join(__dirname, "..", "web");
const BS_ICON_DIR = path.join(__dirname, "..", "node_modules", "bootstrap-icons", "icons");

// Logging
app.use(morgan('short'));
// Static Serving
app.use(express.static(WEB_DIR));
// Bootstrap Icons
app.use('/bsicon', express.static(BS_ICON_DIR))

io.on('connection', sockets.handler);

function startServer() {
    const RUNNING_PORT = config.get('app.port');
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