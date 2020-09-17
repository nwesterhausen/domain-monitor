const express = require('express');
const socketio = require('socket.io');
const morgan = require('morgan');

const app = express();
const http = require('http').createServer(app);
const io = socketio(http);

const path = require('path');
const config = require('config');

const sockets = require('./sockets');


// Logging
app.use(morgan('short'));
// Static Serving
app.use(express.static(path.join(__dirname, "..", "web")));

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
    io.sockets.emit('server restart');
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