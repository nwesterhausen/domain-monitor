const express = require('express')
const app = express();
const http = require('http').createServer(app);
const morgan = require('morgan');
const io = require('socket.io')(http);

const path = require('path');
const config = require('config');

const configure = require('./lib/configure');
const constants = require('./lib/constants');

const RUNNING_PORT = config.get('app.port');

// Logging
app.use(morgan('short'));
// Static Serving
app.use(express.static(path.join(__dirname, "web")));

io.on('connection', (socket) => {
    console.log(`${socket.handshake.address} - WS client ${socket.id} | connection`);
    socket.on(constants.SCK_CONFIG_SET_FILENAME, (filename) => {
        configure.setConfigFile(filename);
    })
    socket.on(constants.SCK_CONFIG_SET_WEBPORT, (val) => {
        configure.setWebPort(val);
    })
})

// Run Web Server
http.listen(RUNNING_PORT, () => {
    console.log(`Web interface available at http://localhost:${RUNNING_PORT}/`)
});