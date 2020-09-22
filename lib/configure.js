const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');

let configurationObject = {};
let loadedfilepath = "UNSET";

const CONFIG_YAML_PATH = path.join(__dirname,'..', 'config', 'config.yaml');
const DOMAIN_YAML_PATH = path.join(__dirname,'..', 'config', 'domain.yaml');

// Return YAML from file
// CALLBACK either a plain object, a string or undefined
function getObjectFromYaml(yamlpath, callback) {
    try {
        const doc = yaml.safeLoad(fs.readFileSync(yamlpath, 'utf8'));
        callback(null, doc);
    } catch (e) {
        callback(e);
    }
}

// Update YAML file from object
// CALLBACK either success (TRUE) or errors
function setYamlFromObject(yamlpath, object, callback) {
    console.log("attempting yaml safe dump before writing");
    let safeYaml = yaml.safeDump(object);
    console.log(safeYaml);
    try {
        fs.writeFileSync(yamlpath, safeYaml);
        callback();
    } catch (e) {
        console.error(`Caught error writing ${JSON.stringify(object)} to ${yamlpath}`);
        callback(e);
    }
}

// Set what config file to modify
function setConfigFile(filename) {
    loadedfilepath = path.join(__dirname,"..", "config", filename)
    getObjectFromYaml(loadedfilepath, (err, data) => {
        if (err) throw err;
        configurationObject = data;
    })
}

function getConfigObject(filename) {
    let yamlpath = path.join(__dirname, "..", "config", filename);
    if (!fs.existsSync(yamlpath)) {
        console.error("Requested filename doesn't exist on expected path");
        console.error(`${filename} doesn't exist at ${yamlpath}`);
        return false;
    }
    if (loadedfilepath === "UNSET" || loadedfilepath !== yamlpath) {
        console.log("Trying to get object from", yamlpath)
        try {
            const doc = yaml.safeLoad(fs.readFileSync(yamlpath, 'utf8'));
            return doc;
        } catch (e) {
            throw e;
        }
    } else {
        return configurationObject;
    }
}

// Commit modified configuration to file
function commitConfigFile(filename=loadedfilepath) {
    if (filename === "UNSET") return false;
    if (filename !== loadedfilepath) {
        setYamlFromObject(path.join(__dirname,"..", "config", filename), configurationObject, (err) => {
            if (err) throw err;
        })
    } else {
        setYamlFromObject(loadedfilepath, configurationObject, (err) => {
            if (err) throw err;
        })
    }
}

// Set domains
function setDomainList(domainList, callback) {
    console.log("got domain list, calling write");
    setYamlFromObject(DOMAIN_YAML_PATH, {
        domains: domainList
    }, callback);
}

// Set webport
function setWebPort(port) {
    configurationObject.app.port = port;
}

module.exports = {
    setConfigFile,
    commitConfigFile,
    setWebPort,
    getConfigObject,
    setDomainList
}