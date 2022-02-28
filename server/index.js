const fs = require("fs");
const path = require("path");

// Log running version
try {
  console.log(`domain-monitor v${require("./package.json").version}`);
} catch {
  console.log(`domain-monitor v${require("../package.json").version}`);
}

// Config file checking
const WHOIS_DATA_PATH = path.join(__dirname, "whois-data");
const SAMPLE_CONFIG_PATH = path.join(__dirname, "sample.config.yaml");
const SAMPLE_DOMAIN_PATH = path.join(__dirname, "sample.domain.yaml");
const CONFIG_DIR = path.join(__dirname, "config");
const USED_CONFIG_PATH = path.join(CONFIG_DIR, "config.yaml");
const USED_DOMAIN_PATH = path.join(CONFIG_DIR, "domain.yaml");

// Check for and create if used paths don't exist.
if (!fs.existsSync(CONFIG_DIR)) {
  console.log("Creating a config directory");
  fs.mkdirSync(CONFIG_DIR);
}
if (!fs.existsSync(USED_CONFIG_PATH)) {
  console.log("Copying sample config to config.yaml");
  fs.copyFileSync(SAMPLE_CONFIG_PATH, USED_CONFIG_PATH);
}
if (!fs.existsSync(USED_DOMAIN_PATH)) {
  console.log("Copying sample domain config to domain.yaml");
  fs.copyFileSync(SAMPLE_DOMAIN_PATH, USED_DOMAIN_PATH);
}
if (!fs.existsSync(WHOIS_DATA_PATH)) {
  console.log("Creating directory for whois data");
  fs.mkdirSync(WHOIS_DATA_PATH);
}

// May end up doing more in this, but for now just launches the server.
require("./lib/server").startServer();
require("./lib/whois-manager");
