const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const CONFIG_YAML_PATH = path.join(__dirname, "..", "config", "config.yaml");
const DOMAIN_YAML_PATH = path.join(__dirname, "..", "config", "domain.yaml");

/**
 * Read a yaml file and turn it into a js object
 * @param {string} yamlpath
 * @param {function} callback
 */
function getObjectFromYaml(yamlpath, callback) {
  try {
    const doc = yaml.safeLoad(fs.readFileSync(yamlpath, "utf8"));
    callback(null, doc);
  } catch (e) {
    callback(e);
  }
}

/**
 * Take a js object and write it into a yaml file
 * @param {string} yamlpath
 * @param {object} object
 * @param {function} callback
 */
function setYamlFromObject(yamlpath, object, callback) {
  console.log("attempting yaml safe dump before writing");
  const safeYaml = yaml.safeDump(object);
  console.log(safeYaml);
  try {
    fs.writeFileSync(yamlpath, safeYaml);
    callback();
  } catch (e) {
    console.error(
      `Caught error writing ${JSON.stringify(object)} to ${yamlpath}`
    );
    callback(e);
  }
}

module.exports = {
  getObjectFromYaml,
  setYamlFromObject,
  CONFIG_YAML_PATH,
  DOMAIN_YAML_PATH,
};
