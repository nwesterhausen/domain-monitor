const fs = require("fs").promises;
const slugid = require("slugid");

const yamler = require("./yamler");

/**
 *
 * @param {object} newDomain
 * @return {Promise}
 */
function updateDomain(newDomain) {
  return promiseValidDomainObj(newDomain)
    .then(promiseUpdateDomain)
    .catch((err) => {
      throw err;
    });
}

/**
 *
 * @param {object} newDomain
 * @return {Promise}
 */
function deleteDomain(newDomain) {
  return promiseValidDomainObj(newDomain).then(promiseDeleteDomain);
}

/**
 *
 * @param {object} domainObj
 * @return {Promise}
 */
function promiseDeleteDomain(domainObj) {
  return fs
    .readFile(yamler.DOMAIN_YAML_PATH)
    .then(yamler.parseObjectFromYaml)
    .then((domainInfo) => {
      const domainList = [];
      for (let i = 0; i < domainInfo.domains.length; i++) {
        if (domainInfo.domains[i].id !== domainObj.id) {
          domainList.push(domainInfo.domains[i]);
        }
      }
      const domainYaml = yamler.parseYamlFromObj({ domains: domainList });
      return fs.writeFile(yamler.DOMAIN_YAML_PATH, domainYaml);
    });
}

/**
 *
 * @param {object} newDomainObj
 * @return {Promise}
 */
function promiseUpdateDomain(newDomainObj) {
  return fs
    .readFile(yamler.DOMAIN_YAML_PATH)
    .then(yamler.parseObjectFromYaml)
    .then((domainInfo) => {
      const domainList = domainInfo.domains;
      let updatedEntry = false;
      for (let i = 0; i < domainList.length; i++) {
        if (domainList[i].id === newDomainObj.id) {
          console.info(
            `DOMAIN: Matched updated domain to ${domainList[i].fqdn}`
          );
          domainList[i].name = newDomainObj.name;
          domainList[i].alerts = newDomainObj.alerts;
          domainList[i].enabled = newDomainObj.enabled;
          domainList[i].fqdn = newDomainObj.fqdn;
          updatedEntry = true;
        }
      }
      if (!updatedEntry) {
        domainList.push(newDomainObj);
      }
      const domainYaml = yamler.parseYamlFromObj({ domains: domainList });
      return fs.writeFile(yamler.DOMAIN_YAML_PATH, domainYaml);
    });
}

/**
 *
 * @param {object} domainObj
 * @return {Promise}
 */
function promiseValidDomainObj(domainObj) {
  return new Promise((resolve, reject) => {
    try {
      resolve(validateDomainObject(domainObj));
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Validate the domain.yaml, adding ids if needed and write-back
 */
function validateDomainYaml() {
  fs.readFile(yamler.DOMAIN_YAML_PATH)
    .then(yamler.parseObjectFromYaml)
    .then((domainInfo) => {
      const domainList = domainInfo.domains;
      const validDomains = [];
      for (let i = 0; i < domainList.length; i++) {
        validDomains.push(validateDomainObject(domainList[i]));
      }
      console.info(
        `DOMAIN: Validated ${validDomains.length} domains in domain.yaml`
      );
      const domainYaml = yamler.parseYamlFromObj({ domains: validDomains });
      return fs.writeFile(yamler.DOMAIN_YAML_PATH, domainYaml);
    })
    .catch((err) => {
      throw err;
    });
}

/**
 * @param {object} domainObj
 * @return {object}
 */
function validateDomainObject(domainObj) {
  const validDomainObj = {};
  if (domainObj.fqdn) {
    validDomainObj.fqdn = domainObj.fqdn;
  } else {
    throw new Error(
      `Invalid domain object, requires 'fqdn'. ${JSON.stringify(domainObj)}`
    );
  }
  if (domainObj.id) {
    validDomainObj.id = domainObj.id;
  } else {
    validDomainObj.id = slugid.nice();
    console.info(
      `DOMAIN: Generated id ${validDomainObj.id} for ${validDomainObj.fqdn}`
    );
  }
  if (domainObj.name) {
    validDomainObj.name = domainObj.name;
  } else {
    validDomainObj.name = validDomainObj.fqdn;
    console.info(`DOMAIN: Used FQDN as Name for ${validDomainObj.id}`);
  }
  validDomainObj.enabled = false | domainObj.enabled;
  validDomainObj.alerts = false | domainObj.alerts;
  return validDomainObj;
}

module.exports = {
  updateDomain,
  deleteDomain,
  validateDomainYaml,
};
