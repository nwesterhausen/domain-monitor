const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const CONFIG_YAML_PATH = path.join(__dirname, '..', 'config', 'config.yaml');
const DOMAIN_YAML_PATH = path.join(__dirname, '..', 'config', 'domain.yaml');

/**
 * Gives an object from the YAML inside specified file.
 * @param {string} yamlpath Path to YAML file to read from
 * @param {function} callback Function to receive object and any error
 * @return {*}
 */
function getObjectFromYaml(yamlpath, callback) {
  try {
    const doc = yaml.safeLoad(fs.readFileSync(yamlpath, 'utf8'));
    return callback(null, doc);
  } catch (e) {
    return callback(e);
  }
}

/**
 * Update YAML file from object. Callback will give you an error if one occurs.
 * @param {string} yamlpath Path to YAML file to write
 * @param {object} object Javascript object to turn into yaml to write
 * @param {function} callback
 * @return {*}
 */
function setYamlFromObject(yamlpath, object, callback) {
  console.log('attempting yaml safe dump before writing');
  const safeYaml = yaml.safeDump(object);
  console.log(safeYaml);
  try {
    fs.writeFileSync(yamlpath, safeYaml);
    return callback();
  } catch (e) {
    console.error(
        `Caught error writing ${JSON.stringify(object)} to ${yamlpath}`
    );
    return callback(e);
  }
}

/**
 * Function takes an array of domain info and will save it to the domain.yaml
 * @param {array} domainList Array of domain objects
 * @param {function} callback
 */
function setDomainList(domainList, callback) {
  console.log('got domain list, calling write');
  setYamlFromObject(DOMAIN_YAML_PATH, {
    domains: domainList,
  }, callback);
}

module.exports = {
  CONFIG_YAML_PATH,
  DOMAIN_YAML_PATH,
  getObjectFromYaml,
  setDomainList,
};
