const server = require('./lib/server');


server.startServer();
setTimeout(() => {
    server.restartServer()
}, 3000)