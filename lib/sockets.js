
const configure = require('./configure');
const constants = require('./constants');

/**
 * Logs a socket action to the console.
 * @param {Socket} socket
 * @param {string} message
 */
function logSocketAction(socket, message) {
  console.log(
      `${socket.handshake.address} - WS client ${socket.id} | ${message}`
  );
}

/**
 * Contains socket handling code.
 * @param {Socket} socket
 */
function socketHandler(socket) {
  // Log connection
  logSocketAction(socket, 'connection');
  // Send configuration to client on connection
  configure.getObjectFromYaml(configure.CONFIG_YAML_PATH, (err, data) => {
    if (err) throw err;
    socket.emit(constants.SCK_LOADED_CFG, data);
  });

  // Send domain list to client on connection
  configure.getObjectFromYaml(configure.CONFIG_YAML_PATH, (err, data) => {
    if (err) throw err;
    socket.emit(constants.SCK_LOADED_DOMAINS, data);
  });

  // Handle events
  socket.on('disconnect', (reason) => {
    logSocketAction(socket, `disconnection ${reason}`);
  });
  socket.on(constants.SCK_UPDATE_DOMAIN, (val) => {
    console.log(`SCK_UPDATE_DOMAIN: ${JSON.stringify(val)}`);
    let domainInfo;
    configure.getObjectFromYaml(
        configure.DOMAIN_YAML_PATH, (err, data) => {
          if (err) throw err;
          domainInfo = data;
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
          configure.setYamlFromObject(configure.DOMAIN_YAML_PATH,
              {domains: domainList}, (err) => {
                if (err) throw err;
                socket.emit(constants.SCK_LOADED_DOMAINS,
                    {domains: domainList});
              });
        });
  });
  socket.on(constants.SCK_DELETE_DOMAIN, (val) => {
    console.log(`SCK_DELETE_DOMAIN: ${JSON.stringify(val)}`);
    const domainInfo = configure.getObjectFromYaml(
        configure.DOMAIN_YAML_PATH, (err) => {
          if (err) throw err;
        });
    const domainList = [];
    for (let i = 0; i < domainInfo.domains.length; i++) {
      if (domainInfo.domains[i].fqdn !== val.fqdn) {
        domainList.push(domainInfo.domains[i]);
      }
    }
    console.log('sending domain list update to configure');
    configure.setYamlFromObject(
        configure.DOMAIN_YAML_PATH, {domains: domainList}, (err) => {
          if (err) throw err;
          socket.emit(constants.SCK_LOADED_DOMAINS,
              {domains: domainList});
        });
  });
}

module.exports = {
  handler: socketHandler,
};
