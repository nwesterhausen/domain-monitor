const fs = require("fs").promises;
const path = require("path");

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
            .readFile(path.join(yamler.WHOIS_DIR_PATH, whoisFiles[i]), {
              encoding: "utf-8"
            })
            .then(yamler.parseObjectFromYaml)
            .then((whoisObj) => {
              logSocketTraffic(
                socket,
                `Sent WHOIS for ${whoisObj.domain_name}`
              );
              socket.emit(constants.SCK_LOADED_WHOIS, whoisObj);
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
  fs.readFile(yamler.CONFIG_YAML_PATH,{encoding: "utf-8"})
    .then(yamler.parseObjectFromYaml)
    .then((configInfo) => {
      socket.emit(constants.SCK_LOADED_CFG, configInfo);
      logSocketTraffic(socket, "sent config");
    })
    .catch((reason) => {
      throw reason;
    });
  // Send domain list to client on connection
  fs.readFile(yamler.DOMAIN_YAML_PATH, {
    encoding: "utf-8"
  })
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
    fs.readFile(yamler.DOMAIN_YAML_PATH, {
    encoding: "utf-8"
  })
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
      .then(() => {
        return fs.readFile(yamler.DOMAIN_YAML_PATH);
      })
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
    fs.readFile(yamler.DOMAIN_YAML_PATH, {
    encoding: "utf-8"
  })
      .then(yamler.parseObjectFromYaml)
      .then((domainInfo) => {
        const domainList = [];
        for (let i = 0; i < domainInfo.domains.length; i++) {
          if (domainInfo.domains[i].fqdn !== val.fqdn) {
            domainList.push(domainInfo.domains[i]);
          }
        }
        const domainYaml = yamler.parseYamlFromObj({ domains: domainList });
        return fs.writeFile(yamler.DOMAIN_YAML_PATH, domainYaml,{encoding: "utf-8"});
      })
      .then(() => {
        return fs.readFile(yamler.DOMAIN_YAML_PATH, { encoding: "utf-8" })
      })
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
    fs.writeFile(yamler.CONFIG_YAML_PATH, configYaml, {
      encoding: "utf-8"
    })
      .then(() => {
        return fs.readFile(yamler.CONFIG_YAML_PATH, {
          encoding: "utf-8"
        });
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
