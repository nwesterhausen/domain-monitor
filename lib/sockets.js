
const configure = require('./configure');
const constants = require('./constants');

/**
 * Logs a socket action to the console.
 * @param {socket} socket
 * @param {string} message
 */
function logSocketAction(socket, message) {
  console.log(
      `${socket.handshake.address} - WS client ${socket.id} | ${message}`
  );
}

/**
 * Contains socket handling code.
 * @param {socket} socket
 */
function socketHandler(socket) {
  // Log connection
  logSocketAction('connection');
  // Send configuration to client on connection
  socket.emit(constants.SCK_LOADED_CFG,
      configure.getObjectFromYaml(configure.CONFIG_YAML_PATH));
  // Send domain list to client on connection
  socket.emit(constants.SCK_LOADED_DOMAINS,
      configure.getObjectFromYaml(configure.DOMAIN_YAML_PATH));

  // Hand events
  socket.on('disconnect', (reason) => {
    logSocketAction(`disconnection ${reason}`);
  });
  socket.on(constants.SCK_CONFIG_SET_FILENAME, (filename) => {
    configure.setConfigFile(filename);
  });
  socket.on(constants.SCK_CONFIG_SET_WEBPORT, (val) => {
    configure.setWebPort(val);
  });
  socket.on(constants.SCK_UPDATE_DOMAIN, (val) => {
    console.log(`SCK_UPDATE_DOMAIN: ${JSON.stringify(val)}`);
    const domainInfo = configure.getConfigObject('domain.yaml');
    const domainList = domainInfo.domains;
    let updatedEntry = false;
    for (let i = 0; i < domainList.length; i++) {
      if (domainList[i].fqdn === val.fqdn) {
        domainList[i].name = val.name;
        domainList[i].alerts = val.alerts;
        updatedEntry = true;
      }
    }
    if (!updatedEntry) {
      domainList.push(val);
    }
    console.log('sending domain list update to configure');
    configure.setDomainList(domainList, (err) => {
      if (err) throw err;
      socket.emit(constants.SCK_LOADED_DOMAINS,
          configure.getObjectFromYaml(configure.DOMAIN_YAML_PATH));
    });
  });
  socket.on(constants.SCK_DELETE_DOMAIN, (val) => {
    console.log(`SCK_DELETE_DOMAIN: ${JSON.stringify(val)}`);
    const domainInfo = configure.getConfigObject('domain.yaml');
    const domainList = [];
    for (let i = 0; i < domainInfo.domains.length; i++) {
      if (domainInfo.domains[i].fqdn !== val.fqdn) {
        domainList.push(domainInfo.domains[i]);
      }
    }
    console.log('sending domain list update to configure');
    configure.setDomainList(domainList, (err) => {
      if (err) throw err;
      socket.emit(constants.SCK_LOADED_DOMAINS,
          configure.getObjectFromYaml(configure.DOMAIN_YAML_PATH));
    });
  });
}

module.exports = {
  handler: socketHandler,
};
