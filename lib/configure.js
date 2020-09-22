const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const CONFIG_YAML_PATH = path.join(__dirname, '..', 'config', 'config.yaml');
const DOMAIN_YAML_PATH = path.join(__dirname, '..', 'config', 'domain.yaml');

/**
 * Gives an object from the YAML inside specified file.
 * @param {string} yamlPath Path to YAML file to read from
 * @param {function} callback Function to receive object and any error
 * @return {*}
 */
function getObjectFromYaml(yamlPath, callback) {
  try {
    const doc = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));
    return callback(null, doc);
  } catch (e) {
    return callback(e);
  }
}

/**
 * Update YAML file from object. Callback will give you an error if one occurs.
 * @param {string} yamlPath Path to YAML file to write
 * @param {object} object Javascript object to turn into yaml to write
 * @param {function} callback
 * @return {*}
 */
function setYamlFromObject(yamlPath, object, callback) {
  console.log('attempting yaml safe dump before writing');
  const safeYaml = yaml.safeDump(object);
  console.log(safeYaml);
  try {
    fs.writeFileSync(yamlPath, safeYaml);
    return callback();
  } catch (e) {
    console.error(
        `Caught error writing ${JSON.stringify(object)} to ${yamlPath}`
    );
    return callback(e);
  }
}

module.exports = {
  CONFIG_YAML_PATH,
  DOMAIN_YAML_PATH,
  getObjectFromYaml,
  setYamlFromObject,
};
