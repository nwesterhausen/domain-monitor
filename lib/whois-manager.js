const path = require("path");
const fs = require("fs");

const yamler = require("./yamler");
const whoislu = require("./whois-lookup");

const NINE_MONTHS_IN_MILLIS = 9 * 30 * 24 * 60 * 60 * 1000;
const THREE_MONTH_IN_MILLIS = 3 * 30 * 24 * 60 * 60 * 1000;
const TWO_MONTH_IN_MILLIS = 2 * 30 * 24 * 60 * 60 * 1000;
const ONE_MONTH_IN_MILLIS = 1 * 30 * 24 * 60 * 60 * 1000;
const TWO_WEEKS_IN_MILLIS = 14 * 24 * 60 * 60 * 1000;
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
const STARTUP_TIMEOUT = 1 * 60 * 1000;

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
  yamler.getObjectFromYaml(yamler.DOMAIN_YAML_PATH, (err, obj) => {
    if (err) throw err;
    const domains = obj.domains;
    for (let i = 0; i < domains.length; i++) {
      if (domains[i].enabled) updateWhoisIfNeeded(domains[i].fqdn);
    }
  });
}

/**
 *
 * @param {string} domain
 * @return {*}
 */
function updateWhoisIfNeeded(domain) {
  const ypath = yamlFilepathFromDomain(domain);
  if (!fs.existsSync(ypath)) {
    console.info(`WHOIS: No existing whois.yaml for ${domain}. Fetching..`);
    return updateWhoisYamlFor(ypath, domain);
  }
  yamler.getObjectFromYaml(ypath, (err, obj) => {
    if (err) throw err;
    console.info(`WHOIS: Checking gather date for ${domain}`);
    const updateTime = new Date(obj.whois_db_update_time);
    let timeDelta = Math.abs(new Date() - updateTime);
    console.info(
      `WHOIS: Age of existing whois.yaml is ${humanReadableTime(
        timeDelta
      )} (${timeDelta})`
    );
    if (timeDelta >= NINE_MONTHS_IN_MILLIS) {
      console.info("WHOIS: Age of whois.yaml > 9 months. Updating..");
      return updateWhoisYamlFor(ypath, domain);
    }
    const expireTime = new Date(obj.registrar.registration_expiration);
    timeDelta = Math.abs(new Date() - expireTime);
    console.info(
      `WHOIS: ${domain} expires in ${humanReadableTime(
        timeDelta
      )} on ${expireTime.toDateString()}`
    );
    const fudgedDelta = timeDelta - UPDATE_INTERVAL;
    if (fudgedDelta < TWO_WEEKS_IN_MILLIS && timeDelta >= TWO_WEEKS_IN_MILLIS) {
      console.info(
        `WHOIS: Less than two weeks until expiriry. Updating whois.yaml`
      );
      return updateWhoisYamlFor(ypath, domain);
    }
    if (fudgedDelta < ONE_MONTH_IN_MILLIS && timeDelta >= ONE_MONTH_IN_MILLIS) {
      console.info(
        `WHOIS: Less than one month until expiriry. Updating whois.yaml`
      );
      return updateWhoisYamlFor(ypath, domain);
    }
    if (fudgedDelta < TWO_MONTH_IN_MILLIS && timeDelta >= TWO_MONTH_IN_MILLIS) {
      console.info(
        `WHOIS: Less than two months until expiriry. Updating whois.yaml`
      );
      return updateWhoisYamlFor(ypath, domain);
    }
    if (
      fudgedDelta < THREE_MONTH_IN_MILLIS &&
      timeDelta >= THREE_MONTH_IN_MILLIS
    ) {
      console.info(
        `WHOIS: Less than three months until expiriry. Updating whois.yaml`
      );
      return updateWhoisYamlFor(ypath, domain);
    }
    console.info(`WHOIS: Within age boundary checks for ${domain} whois.yaml`);
    return true;
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
 */
function updateWhoisYamlFor(ypath, domain) {
  whoislu.getWhoisFor(domain, (err, data) => {
    if (err) {
      console.error(`WHOIS: Failure looking up ${domain}`);
      return console.error("WHOIS:", err);
    }
    if (!data.registrar || !data.registrar.registration_expiration) {
      return console.error(
        `WHOIS: Lookup returned empty data for ${domain}.`,
        JSON.stringify(data)
      );
    }
    yamler.setYamlFromObject(ypath, data, (err) => {
      if (err) return console.error("WHOIS: YAML WRITE", err);
      console.info(`WHOIS: Saved new whois.yaml for ${domain}`);
    });
  });
}
