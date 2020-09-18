
const configure = require('./configure');
const constants = require('./constants');

function socketHandler(socket) {
    // Log connection
    console.log(`${socket.handshake.address} - WS client ${socket.id} | connection`);
    // Send configuration to client on connection
    socket.emit(constants.SCK_LOADED_CFG, configure.getConfigObject("default.yaml"))
    // Send domain list to client on connection
    socket.emit(constants.SCK_LOADED_DOMAINS, configure.getConfigObject('domains.yaml'))

    // Hand events
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