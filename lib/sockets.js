const fs = require("fs").promises;
const path = require("path");

const yamler = require("./yamler");
const constants = require("./constants");
const domains = require("./domains");

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
 *
 * @param {Socket} socket
 * @param {object} domainInfo
 */
function sendCachedWHOISData(socket, domainInfo) {
  const allDomains = [];
  domainInfo.domains.map((domain) => {
    allDomains.push(domain.fqdn);
  });
  fs.readdir(yamler.WHOIS_DIR_PATH)
    .then((whoisFiles) => {
      for (let i = 0; i < allDomains.length; i++) {
        if (whoisFiles.indexOf(`${allDomains[i]}.yaml`) == -1) {
          logSocketTraffic(socket, `No cached WHOIS for ${allDomains[i]}`);
          socket.emit(constants.SCK_WHOIS_CACHE_MISS, allDomains[i]);
        }
      }
      const sendWhoisPromises = [];
      for (let i = 0; i < whoisFiles.length; i++) {
        sendWhoisPromises.push(
          fs
            .readFile(path.join(yamler.WHOIS_DIR_PATH, whoisFiles[i]))
            .then(yamler.parseObjectFromYaml)
            .then((whoisObj) => {
              if (allDomains.indexOf(whoisObj.domain_name) !== -1) {
                logSocketTraffic(
                  socket,
                  `Sent WHOIS for ${whoisObj.domain_name}`
                );
                socket.emit(constants.SCK_LOADED_WHOIS, whoisObj);
              } else {
                console.warn(
                  `SOCK: Cached WHOIS for domain missing from domain.yaml (${whoisObj.domain_name})`
                );
              }
            })
        );
      }
      return Promise.all(sendWhoisPromises);
    })
    .catch((error) => {
      throw error;
    });
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
      sendCachedWHOISData(socket, domainInfo);
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
    domains
      .updateDomain(val)
      .then(fs.readFile(yamler.DOMAIN_YAML_PATH))
      .then(yamler.parseObjectFromYaml)
      .then((domainInfo) => {
        socket.emit(constants.SCK_LOADED_DOMAINS, domainInfo);
        logSocketTraffic(socket, "sent domain update.");
        sendCachedWHOISData(socket, domainInfo);
      })
      .catch((error) => {
        throw error;
      });
  });
  socket.on(constants.SCK_DELETE_DOMAIN, (val) => {
    logSocketTraffic(socket, `SCK_DELETE_DOMAIN: ${JSON.stringify(val)}`);
    domains
      .deleteDomain(val)
      .then(fs.readFile(yamler.DOMAIN_YAML_PATH))
      .then(yamler.parseObjectFromYaml)
      .then((domainInfo) => {
        socket.emit(constants.SCK_LOADED_DOMAINS, domainInfo);
        logSocketTraffic(socket, "sent domain update");
        sendCachedWHOISData(socket, domainInfo);
      })
      .catch((error) => {
        throw error;
      });
  });
  socket.on(constants.SCK_UPDATE_CONFIG, (val) => {
    logSocketTraffic(socket, `SCK_UPDATE_CONFIG: ${JSON.stringify(val)}`);
    const configYaml = yamler.parseYamlFromObj(val);
    fs.writeFile(yamler.CONFIG_YAML_PATH, configYaml)
      .then(() => {
        return fs.readFile(yamler.CONFIG_YAML_PATH);
      })
      .then(yamler.parseObjectFromYaml)
      .then((configObj) => {
        socket.emit(constants.SCK_LOADED_CFG, configObj);
        logSocketTraffic(
          socket,
          `sent config update ${JSON.stringify(configObj)}`
        );
      })
      .catch((error) => {
        throw error;
      });
  });
}

module.exports = {
  handler: socketHandler,
};
