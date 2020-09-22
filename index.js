const fs = require('fs');
	const path = require('path');


	const server = require('./lib/server');

// Config file checking
const SAMPLE_CONFIG_PATH = path.join(__dirname, "config", "sample.config.yaml");
	const SAMPLE_DOMAIN_PATH = path.join(__dirname, "config", "sample.domain.yaml");
const USED_CONFIG_PATH = path.join(__dirname, "config", "config.yaml");

const USED_DOMAIN_PATH = path.join(__dirname, "config", "domain.yaml");

// Check for and create if used paths don't exist.
if (! fs.existsSync(USED_CONFIG_PATH)) {
    console.log("Copying sample config to config.yaml");
    fs.copyFileSync(SAMPLE_CONFIG_PATH, USED_CONFIG_PATH);
}
if (! fs.existsSync(USED_DOMAIN_PATH)) {
    console.log("Copying sample domain config to domain.yaml");
    fs.copyFileSync(SAMPLE_DOMAIN_PATH, USED_DOMAIN_PATH);
}

// May end up doing more in this, but for now just launches the server.
server.startServer();
