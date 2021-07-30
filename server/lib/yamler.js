const yaml = require("js-yaml");
const path = require("path");

const CONFIG_YAML_PATH = path.join(__dirname, "..", "config", "config.yaml");
const DOMAIN_YAML_PATH = path.join(__dirname, "..", "config", "domain.yaml");
const WHOIS_DIR_PATH = path.join(__dirname, "..", "whois-data");

/**
 * Give this some YAML and it resolves to a JS Object
 * @param {string} yamldoc
 * @return {Promise}
 */
function parseObjectFromYaml(yamldoc) {
  const promisedObject = function (resolve, reject) {
    try {
      resolve(yaml.safeLoad(yamldoc));
    } catch (e) {
      console.error(`YAML: Unable to parse from doc:`);
      console.error(yamldoc);
      reject(e);
    }
  };
  return new Promise(promisedObject);
}

/**
 * Gives YAML string from a js object
 * @param {object} obj
 * @return {string}
 */
function parseYamlFromObj(obj) {
  return yaml.safeDump(obj);
}

module.exports = {
  parseObjectFromYaml,
  parseYamlFromObj,
  CONFIG_YAML_PATH,
  DOMAIN_YAML_PATH,
  WHOIS_DIR_PATH,
};
