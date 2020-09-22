const configure = require("./configure");
const constants = require("./constants");

/**
 * Helper function to log socket traffic to console
 * @param {Socket} socket
 * @param {string} message
 */
function logSocketTraffic(socket, message) {
  console.log(
    `${socket.handshake.address} - WS client ${socket.id} | ${message}`
  );
}

/**
 * Function which handles socket communication
 * @param {Socket} socket
 */
function socketHandler(socket) {
  // Log connection
  logSocketTraffic(socket, "connection");
  // Send configuration to client on connection
  configure.getObjectFromYaml(configure.CONFIG_YAML_PATH, (err, config) => {
    if (err) throw err;
    socket.emit(constants.SCK_LOADED_CFG, config);
    logSocketTraffic(socket, "sent config");
  });
  // Send domain list to client on connection
  configure.getObjectFromYaml(configure.DOMAIN_YAML_PATH, (err, domains) => {
    if (err) throw err;
    socket.emit(constants.SCK_LOADED_DOMAINS, domains);
    logSocketTraffic(socket, "sent domains");
  });

  // Hand events
  socket.on("disconnect", (reason) => {
    logSocketTraffic(socket, `disconnection (${reason})`);
  });
  socket.on(constants.SCK_UPDATE_DOMAIN, (val) => {
    logSocketTraffic(socket, `SCK_UPDATE_DOMAIN: ${JSON.stringify(val)}`);
    configure.getObjectFromYaml(
      configure.DOMAIN_YAML_PATH,
      (err, domainInfo) => {
        if (err) throw err;
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
        configure.setYamlFromObject(
          configure.DOMAIN_YAML_PATH,
          { domains: domainList },
          (err) => {
            if (err) throw err;
            socket.emit(constants.SCK_LOADED_DOMAINS, { domains: domainList });
            logSocketTraffic(socket, "sent domain update");
          }
        );
      }
    );
  });
  socket.on(constants.SCK_DELETE_DOMAIN, (val) => {
    logSocketTraffic(socket, `SCK_DELETE_DOMAIN: ${JSON.stringify(val)}`);

    configure.getObjectFromYaml(
      configure.DOMAIN_YAML_PATH,
      (err, domainInfo) => {
        if (err) throw err;
        const domainList = [];
        for (let i = 0; i < domainInfo.domains.length; i++) {
          if (domainInfo.domains[i].fqdn !== val.fqdn) {
            domainList.push(domainInfo.domains[i]);
          }
        }

        configure.setYamlFromObject(
          configure.DOMAIN_YAML_PATH,
          { domains: domainList },
          (err) => {
            if (err) throw err;
            socket.emit(constants.SCK_LOADED_DOMAINS, { domains: domainList });
            logSocketTraffic(socket, "sent domain update");
          }
        );
      }
    );
  });
}

module.exports = {
  handler: socketHandler,
};
