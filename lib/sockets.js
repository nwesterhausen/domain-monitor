
const configure = require('./configure');
const constants = require('./constants');

function socketHandler(socket) {
    console.log(`${socket.handshake.address} - WS client ${socket.id} | connection`);
    socket.on('disconnect', (reason) => {
        console.log(`${socket.handshake.address} - WS client ${socket.id} | disconnection (${reason})`);
    })
    socket.on(constants.SCK_CONFIG_SET_FILENAME, (filename) => {
        configure.setConfigFile(filename);
    })
    socket.on(constants.SCK_CONFIG_SET_WEBPORT, (val) => {
        configure.setWebPort(val);
    })
}

module.exports = {
    handler: socketHandler
}