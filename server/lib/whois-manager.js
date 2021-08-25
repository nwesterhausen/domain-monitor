const path = require("path");
const fs = require("fs").promises;
const whois = require("whois-promise");
const existsSync = require("fs").existsSync;

const yamler = require("./yamler");

const NINE_MONTHS_IN_MILLIS = 9 * 30 * 24 * 60 * 60 * 1000;
const THREE_MONTH_IN_MILLIS = 3 * 30 * 24 * 60 * 60 * 1000;
const TWO_MONTH_IN_MILLIS = 2 * 30 * 24 * 60 * 60 * 1000;
const ONE_MONTH_IN_MILLIS = 1 * 30 * 24 * 60 * 60 * 1000;
const TWO_WEEKS_IN_MILLIS = 14 * 24 * 60 * 60 * 1000;
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
const STARTUP_TIMEOUT = 1 * 60 * 1000;

const ATTRIBUTE_REGEX = /(^[^:]+): (.*)/;

// Start whois look ups after STARTUP TIMEOUT and rerun the whois update
// every UPDATE_INTERVAL
setTimeout(function go() {
  doWhoisUpdates();
  setInterval(doWhoisUpdates, UPDATE_INTERVAL);
}, STARTUP_TIMEOUT);

/**
 * Run the whois updates
 */
function doWhoisUpdates() {
  fs.readFile(yamler.DOMAIN_YAML_PATH, { encoding: "utf-8" })
    .then(yamler.parseObjectFromYaml)
    .then((domainInfo) => {
      const whoisPromises = [];
      const domains = domainInfo.domains;
      for (let i = 0; i < domains.length; i++) {
        if (domains[i].enabled)
          whoisPromises.push(updateWhoisIfNeeded(domains[i].fqdn));
      }
      return Promise.all(whoisPromises);
    })
    .then((results) => {
      console.debug("WHOIS: Cached entries: ");
      for (const singleResult of results) {
        console.debug(singleResult);
      }
    })
    .catch((error) => {
      throw error;
    });
}

/**
 *
 * @param {string} domain
 * @return {Promise}
 */
function updateWhoisIfNeeded(domain) {
  const ypath = yamlFilepathFromDomain(domain);
  return new Promise(function (resolve, reject) {
    console.log(`creating whois promise for ${domain}`);
    if (!existsSync(ypath)) {
      console.info(`WHOIS: No existing whois.yaml for ${domain}. Fetching..`);
      return resolve(updateWhoisYamlFor(ypath, domain));
    }
    console.info(`WHOIS: Validating cached whois data for ${domain}`);
    fs.readFile(ypath, { encoding: "utf-8" })
      .then((filedata) => {
        return yamler.parseObjectFromYaml(filedata);
      })
      .then((whoisInfo) => {
        const updateTime = new Date(whoisInfo.whois_db_update_time);
        let timeDelta = Math.abs(new Date() - updateTime);
        console.info(
          `WHOIS: Age of existing whois.yaml is ${humanReadableTime(
            timeDelta
          )} (${timeDelta})`
        );
        if (timeDelta >= NINE_MONTHS_IN_MILLIS) {
          console.info("WHOIS: Age of whois.yaml > 9 months. Updating..");
          return resolve(updateWhoisYamlFor(ypath, domain));
        }
        const expireTime = new Date(
          whoisInfo.registrar.registration_expiration
        );
        timeDelta = Math.abs(new Date() - expireTime);
        console.info(
          `WHOIS: ${domain} expires in ${humanReadableTime(
            timeDelta
          )} on ${expireTime.toDateString()}`
        );
        const fudgedDelta = timeDelta - UPDATE_INTERVAL;
        if (
          fudgedDelta < TWO_WEEKS_IN_MILLIS &&
          timeDelta >= TWO_WEEKS_IN_MILLIS
        ) {
          console.info(
            `WHOIS: Less than two weeks until expiriry. Updating whois.yaml`
          );
          return resolve(updateWhoisYamlFor(ypath, domain));
        }
        if (
          fudgedDelta < ONE_MONTH_IN_MILLIS &&
          timeDelta >= ONE_MONTH_IN_MILLIS
        ) {
          console.info(
            `WHOIS: Less than one month until expiriry. Updating whois.yaml`
          );
          return resolve(updateWhoisYamlFor(ypath, domain));
        }
        if (
          fudgedDelta < TWO_MONTH_IN_MILLIS &&
          timeDelta >= TWO_MONTH_IN_MILLIS
        ) {
          console.info(
            `WHOIS: Less than two months until expiriry. Updating whois.yaml`
          );
          return resolve(updateWhoisYamlFor(ypath, domain));
        }
        if (
          fudgedDelta < THREE_MONTH_IN_MILLIS &&
          timeDelta >= THREE_MONTH_IN_MILLIS
        ) {
          console.info(
            `WHOIS: Less than three months until expiriry. Updating whois.yaml`
          );
          return resolve(updateWhoisYamlFor(ypath, domain));
        }
        console.info(
          `WHOIS: Within age boundary checks for ${domain} whois.yaml`
        );
        return resolve([domain, true]);
      })
      .catch(console.error);
  });
}

/**
 *
 * @param {string} domain
 * @return {string} filepath to yaml
 */
function yamlFilepathFromDomain(domain) {
  return path.join(yamler.WHOIS_DIR_PATH, `${domain}.yaml`);
}

/**
 * Get time in Days:Hours:Mins:Secs
 * @param {Date} time
 * @return {string}
 */
function humanReadableTime(time) {
  let secs = time / 1000;

  // calculate (and subtract) whole days
  const days = Math.floor(secs / 86400);
  secs -= days * 86400;

  // calculate (and subtract) whole hours
  const hours = Math.floor(secs / 3600) % 24;
  secs -= hours * 3600;

  // calculate (and subtract) whole minutes
  const minutes = Math.floor(secs / 60) % 60;
  secs -= minutes * 60;

  // what's left is seconds
  const seconds = Math.floor(secs);

  return `${days < 10 ? "0" + days : days}:${
    hours < 10 ? "0" + hours : hours
  }:${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
}

/**
 *
 * @param {string} ypath yaml path
 * @param {string} domain
 * @return {Promise}
 */
function updateWhoisYamlFor(ypath, domain) {
  return whois
    .raw(domain, {})
    .then((data) => {
      if (data.match(/no match for|not found/i)) {
        console.info(`WHOIS Request for ${domain} returned no match!`)
        console.debug(`-- BEGIN WHOIS RESPONSE --\n${data}\n-- END WHOIS RESPONSE --`);
        console.info(`Skipping writing to cache, will try again soon.`)
        return;
      }
      const whoisData = simplifyWhois(data);
      return writeWhoisData(ypath, whoisData);
    })
    .catch((error) => {
      console.error(error);
    });
}

/**
 *
 * @param {string} ypath
 * @param {Object} whoisObj
 * @return {Promise}
 */
function writeWhoisData(ypath, whoisObj) {
  return new Promise((resolve, reject) => {
    if (whoisObj === {} || Object.keys(whoisObj).length == 0) {
      reject(new Error("WHOIS: Empty WHOIS Response"));
    } else if (whoisObj.raw) {
      reject(new Error(whoisObj.raw));
    } else {
      const whoisYaml = yamler.parseYamlFromObj(whoisObj);
      resolve(fs.writeFile(ypath, whoisYaml));
    }
  });
}

/**
 * Takes the string from whois.lookup and parses it into an object.
 * @param {string} whoisdata
 * @return {object}
 */
function simplifyWhois(whoisdata) {
  console.info(`${typeof whoisdata} received.`, whoisdata);
  // Clean CRLF into LF
  whoisdata = whoisdata.replace(/\r\n/g, "\n");

  const whoisObject = [];
  if (/:\n/.test(whoisdata)) {
    console.info(
      "Key found before newline, attempting to elaborate whois data."
    );

    const tmpWhoisObject = whoisdata.split(/\n/);
    let rootkey = "";
    for (let i = 0; i < tmpWhoisObject.length; i++) {
      const matched = tmpWhoisObject[i].match(ATTRIBUTE_REGEX);
      if (/:$/.test(tmpWhoisObject[i])) {
        // console.debug("Matched rootkey");
        rootkey = tmpWhoisObject[i].split(":")[0];
      } else if (/\s{8}/.test(tmpWhoisObject[i])) {
        // console.debug("Matched childkey or value");
        if (matched && matched.length > 1) {
          // console.debug("Determined child key, so combining");
          whoisObject.push(
            `${rootkey}_${matched[1].trim()}: ${matched[2].trim()}`
          );
        } else {
          // console.debug("Determined child value.");
          whoisObject.push(`${rootkey}: ${tmpWhoisObject[i].trim()}`);
        }
      } else if (matched && matched.length > 1) {
        // console.debug("Matched root key and value");
        whoisObject.push(tmpWhoisObject[i]);
      } else {
        // console.debug(`unable to match ${tmpWhoisObject[i]}`);
      }
    }
  } else {
    whoisObject.concat(whoisdata.split(/\n/));
  }
  console.info(whoisObject.length, "entries in whoisdata");
  // console.dir(whoisObject);
  if (whoisdata.endsWith("was refused.")) {
    console.error(whoisdata);
  }
  if (Object.keys(whoisObject).length == 0) {
    let dumpath = path.join(yamler.WHOIS_DIR_PATH,"./whois.parse-error.dump");
    console.error(`Parsing seems to have failed, writing dump: ${dumpath}`);
    fs.writeFile(dumpath, whoisdata).catch(console.error);
    return { raw: whoisdata };
  }
  const simplifiedObject = {
    registry: {},
    registrar: {},
    registrant: {},
    registrant_admin: {},
    registrant_tech: {},
    name_server: [],
    domain_status: [],
    unmatched_data: [],
  };
  for (let i = 0; i < whoisObject.length; i++) {
    const matched = whoisObject[i].match(ATTRIBUTE_REGEX);
    if (matched && matched.length > 1) {
      switch (matched[1].trim()) {
        case "Domain name":
        case "Domain Name":
        case "Domain":
          simplifiedObject.domain_name = matched[2].toLowerCase();
          break;
        case "Registry Domain ID":
          simplifiedObject.registry.domain_id = matched[2];
          break;
        case "Registry Registrant ID":
          simplifiedObject.registry.registrant_id = matched[2];
          break;
        case "Registry Admin ID":
          simplifiedObject.registry.admin_id = matched[2];
          break;
        case "Registry Tech ID":
          simplifiedObject.registry.tech_id = matched[2];
          break;
        case "Registrar WHOIS Server":
          simplifiedObject.registrar.whois = matched[2];
          break;
        case "Registrar URL":
          simplifiedObject.registrar.url = matched[2];
          break;
        case "Updated Date":
          simplifiedObject.updated_date = matched[2];
          break;
        case "Creation Date":
          simplifiedObject.created_date = matched[2];
          break;
        case "Registrar Registration Expiration Date":
          simplifiedObject.registrar.registration_expiration = matched[2];
          break;
        case "Registrar":
          simplifiedObject.registrar.name = matched[2];
          break;
        case "Registrar Abuse Contact Email":
          simplifiedObject.registrar.abuse_email = matched[2];
          break;
        case "Registrar Abuse Contact Phone":
          simplifiedObject.registrar.abuse_phone = matched[2];
          break;
        case "Registrar IANA ID":
          simplifiedObject.registrar.iana_id = matched[2];
          break;
        case "Domain Status":
          simplifiedObject.domain_status.push(matched[2]);
          break;
        case "Name Server":
        case "Name servers":
          simplifiedObject.name_server.push(matched[2]);
          break;
        case "Reseller":
          simplifiedObject.reseller = matched[2];
          break;
        case "Registrant Name":
          simplifiedObject.registrant.name = matched[2];
          break;
        case "Registrant Organization":
          simplifiedObject.registrant.organization = matched[2];
          break;
        case "Registrant Street":
          simplifiedObject.registrant.street = matched[2];
          break;
        case "Registrant City":
          simplifiedObject.registrant.city = matched[2];
          break;
        case "Registrant State/Province":
          simplifiedObject.registrant.state_province = matched[2];
          break;
        case "Registrant Postal Code":
          simplifiedObject.registrant.postal_code = matched[2];
          break;
        case "Registrant Country":
          simplifiedObject.registrant.country = matched[2];
          break;
        case "Registrant Phone":
          simplifiedObject.registrant.phone = matched[2];
          break;
        case "Registrant Phone Ext":
          simplifiedObject.registrant.phone_ext = matched[2];
          break;
        case "Registrant Fax":
          simplifiedObject.registrant.fax = matched[2];
          break;
        case "Registrant Fax Ext":
          simplifiedObject.registrant.fax_ext = matched[2];
          break;
        case "Registrant Email":
          simplifiedObject.registrant.email = matched[2];
          break;
        case "Admin Name":
          simplifiedObject.registrant_admin.name = matched[2];
          break;
        case "Admin Organization":
          simplifiedObject.registrant_admin.organization = matched[2];
          break;
        case "Admin Street":
          simplifiedObject.registrant_admin.street = matched[2];
          break;
        case "Admin City":
          simplifiedObject.registrant_admin.city = matched[2];
          break;
        case "Admin State/Province":
          simplifiedObject.registrant_admin.state_province = matched[2];
          break;
        case "Admin Postal Code":
          simplifiedObject.registrant_admin.postal_code = matched[2];
          break;
        case "Admin Country":
          simplifiedObject.registrant_admin.country = matched[2];
          break;
        case "Admin Phone":
          simplifiedObject.registrant_admin.phone = matched[2];
          break;
        case "Admin Phone Ext":
          simplifiedObject.registrant_admin.phone_ext = matched[2];
          break;
        case "Admin Fax":
          simplifiedObject.registrant_admin.fax = matched[2];
          break;
        case "Admin Fax Ext":
          simplifiedObject.registrant_admin.fax_ext = matched[2];
          break;
        case "Admin Email":
          simplifiedObject.registrant_admin.email = matched[2];
          break;
        case "Tech Name":
          simplifiedObject.registrant_tech.name = matched[2];
          break;
        case "Tech Organization":
          simplifiedObject.registrant_tech.organization = matched[2];
          break;
        case "Tech Street":
          simplifiedObject.registrant_tech.street = matched[2];
          break;
        case "Tech City":
          simplifiedObject.registrant_tech.city = matched[2];
          break;
        case "Tech State/Province":
          simplifiedObject.registrant_tech.state_province = matched[2];
          break;
        case "Tech Postal Code":
          simplifiedObject.registrant_tech.postal_code = matched[2];
          break;
        case "Tech Country":
          simplifiedObject.registrant_tech.country = matched[2];
          break;
        case "Tech Phone":
          simplifiedObject.registrant_tech.phone = matched[2];
          break;
        case "Tech Phone Ext":
          simplifiedObject.registrant_tech.phone_ext = matched[2];
          break;
        case "Tech Fax":
          simplifiedObject.registrant_tech.fax = matched[2];
          break;
        case "Tech Fax Ext":
          simplifiedObject.registrant_tech.fax_ext = matched[2];
          break;
        case "Tech Email":
          simplifiedObject.registrant_tech.email = matched[2];
          break;
        case "DNSSEC":
          simplifiedObject.dnssec = matched[2];
          break;
        case ">>> Last update of WHOIS database":
          simplifiedObject.whois_db_update_time =
            matched[2].match(/^[^< ]+/)[0];
          break;
        case "URL of the ICANN WHOIS Data Problem Reporting System":
          // Do nothing
          break;
        default:
          simplifiedObject.unmatched_data.push({
            attribute: matched[1],
            value: matched[2],
          });
          break;
      }
    } else if (whoisObject[i].startsWith("Access to")) {
      simplifiedObject.tos = whoisObject[i];
    }
  }
  if (!simplifiedObject.domain_name) {
    console.error(`No domain name found in whois response.`);
    return {};
  }
  if (simplifiedObject.name_server.length == 0) {
    console.warn(
      `${simplifiedObject.doamin_name} WHOIS: unable to parse name servers.`
    );
  }
  if (!simplifiedObject.whois_db_update_time) {
    console.warn(
      "WHOIS query did not attached a timestamp, using current time."
    );
    simplifiedObject.whois_db_update_time = new Date().toISOString();
  }
  return simplifiedObject;
}

module.exports = {
  simplifyWhois,
};
