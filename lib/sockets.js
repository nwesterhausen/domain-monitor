
const configure = require('./configure');
const constants = require('./constants');

function socketHandler(socket) {
    // Log connection
    console.log(`${socket.handshake.address} - WS client ${socket.id} | connection`);
    // Send configuration to client on connection
    socket.emit(constants.SCK_LOADED_CFG, configure.getConfigObject("config.yaml"))
    // Send domain list to client on connection
    socket.emit(constants.SCK_LOADED_DOMAINS, configure.getConfigObject('domain.yaml'))

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
    socket.on(constants.SCK_UPDATE_DOMAIN, (val) => {
        console.log(`SCK_UPDATE_DOMAIN: ${JSON.stringify(val)}`);
        let domainInfo = configure.getConfigObject('domain.yaml');
        let domainList = domainInfo.domains;
        let updatedEntry = false;
        for (let i = 0; i < domainList.length; i++) {
                if (domainList[i].fqdn === val.fqdn) {
                    domainList[i].name = val.name;
                    domainList[i].alerts = val.alerts
                    updatedEntry = true;
            }
        }
        if (!updatedEntry) {
            domainList.push(val);
        }
        console.log("sending domain list update to configure");
        configure.setDomainList(domainList, (err) => {
            if (err) throw err;
            socket.emit(constants.SCK_LOADED_DOMAINS, configure.getConfigObject('domain.yaml'))
        });
    });
    socket.on(constants.SCK_DELETE_DOMAIN, (val) => {
        console.log(`SCK_DELETE_DOMAIN: ${JSON.stringify(val)}`);
        let domainInfo = configure.getConfigObject('domain.yaml');
        let domainList = []
        for (let i = 0; i < domainInfo.domains.length; i++) {
            if (domainInfo.domains[i].fqdn !== val.fqdn) {
                domainList.push(domainInfo.domains[i])
            }
        }
        console.log("sending domain list update to configure");
        configure.setDomainList(domainList, (err) => {
            if (err) throw err;
            socket.emit(constants.SCK_LOADED_DOMAINS, configure.getConfigObject('domain.yaml'))
        });
    })
}

module.exports = {
    handler: socketHandler
}