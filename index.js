const server = require('./lib/server');

// TODO: rename included config files to sample.config.yaml and sample.domain.yaml
// TODO: check if config.yaml and domain.yaml are in config folder, if not copy samples for that

// TODO: set expectation that app config is in config.yaml
// TODO: set expectation that domain config is in domain.yaml

// TODO: how to handle WHOIS results and where to keep track of that.

// May end up doing more in this, but for now just launches the server.
server.startServer();