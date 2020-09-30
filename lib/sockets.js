const fs = require("fs").promises;

const yamler = require("./yamler");
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
  fs.readFile(yamler.CONFIG_YAML_PATH)
    .then(yamler.parseObjectFromYaml)
    .then((configInfo) => {
      socket.emit(constants.SCK_LOADED_CFG, configInfo);
      logSocketTraffic(socket, "sent config");
    })
    .catch((reason) => {
      throw reason;
    });
  // Send domain list to client on connection
  fs.readFile(yamler.DOMAIN_YAML_PATH)
    .then(yamler.parseObjectFromYaml)
    .then((domainInfo) => {
      socket.emit(constants.SCK_LOADED_DOMAINS, domainInfo);
      logSocketTraffic(socket, "sent domains");
    })
    .catch((reason) => {
      throw reason;
    });

  // Hand events
  socket.on("disconnect", (reason) => {
    logSocketTraffic(socket, `disconnection (${reason})`);
  });
  socket.on(constants.SCK_UPDATE_DOMAIN, (val) => {
    logSocketTraffic(socket, `SCK_UPDATE_DOMAIN: ${JSON.stringify(val)}`);
    fs.readFile(yamler.DOMAIN_YAML_PATH)
      .then(yamler.parseObjectFromYaml)
      .then((domainInfo) => {
        const domainList = domainInfo.domains;
        let updatedEntry = false;
        for (let i = 0; i < domainList.length; i++) {
          if (domainList[i].fqdn === val.fqdn) {
            console.info(
              `SOCK: Matched updated domain to ${domainList[i].fqdn}`
            );
            domainList[i].name = val.name;
            domainList[i].alerts = val.alerts;
            domainList[i].enabled = val.enabled;
            updatedEntry = true;
          }
        }
        if (!updatedEntry) {
          domainList.push(val);
        }
        const domainYaml = yamler.parseYamlFromObj({ domains: domainList });
        return fs.writeFile(yamler.DOMAIN_YAML_PATH, domainYaml);
      })
      .then(fs.readFile(yamler.DOMAIN_YAML_PATH))
      .then(yamler.getObjectFromYaml)
      .then((domainInfo) => {
        socket.emit(constants.SCK_LOADED_DOMAINS, domainInfo);
        logSocketTraffic(socket, "sent domain update.");
      })
      .catch((error) => {
        throw error;
      });
  });
  socket.on(constants.SCK_DELETE_DOMAIN, (val) => {
    logSocketTraffic(socket, `SCK_DELETE_DOMAIN: ${JSON.stringify(val)}`);
    fs.readFile(yamler.DOMAIN_YAML_PATH)
      .then(yamler.parseObjectFromYaml)
      .then((domainInfo) => {
        const domainList = [];
        for (let i = 0; i < domainInfo.domains.length; i++) {
          if (domainInfo.domains[i].fqdn !== val.fqdn) {
            domainList.push(domainInfo.domains[i]);
          }
        }
        const domainYaml = yamler.parseYamlFromObj({ domains: domainList });
        return fs.writeFile(yamler.DOMAIN_YAML_PATH, domainYaml);
      })
      .then(fs.readFile(yamler.DOMAIN_YAML_PATH))
      .then(yamler.parseObjectFromYaml)
      .then((domainInfo) => {
        socket.emit(constants.SCK_LOADED_DOMAINS, domainInfo);
        logSocketTraffic(socket, "sent domain update");
      })
      .catch((error) => {
        throw error;
      });
  });
}

module.exports = {
  handler: socketHandler,
};
