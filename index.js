'use strict';
require('./lib/projectEnv');
const clients = projectEnv.clients;
const cluster = projectEnv.cluster;
const db = projectEnv.db;
const express = projectEnv.express;
const fork = projectEnv.fork;
const log = projectEnv.log;
const sio = projectEnv.socket.io;
const sioRedis = projectEnv.socket.ioRedis;
const sioEmitter = projectEnv.socket.ioEmitter({ host: 'localhost', port: 6379 });
const dbConnectionString = 'mongodb://localhost/node_test';

fork({
    port: 3000,
    processCount: projectEnv.os.cpus().length,
}, function(callback) {
    projectEnv.setLogLabel('worker' + cluster.worker.id);
    db.connect(dbConnectionString)
    .then(function(db) {
        log.debug('connected to:', dbConnectionString);
        const app = express();
        app.use(express.static('public'));
        const server = app.listen(0, 'localhost');
        const io = sio(server);
        io.adapter(sioRedis({ host: 'localhost', port: 6379 }));
        io.on('connection', registerClient);
        process.nextTick(() => callback(server));
    })
    .catch(log.error);
});

function registerClient(socket) {
    log.debug(`<${socket.id}> connection`);
    clients.add(socket);
    log.debug(`${clients.size} clients connected to this worker`);
    socket.on('error', err => {
        throw err;
    });
    socket.on('client_command', clientCommandHandler(socket));
    socket.on('disconnect', clientDisconnectHandler(socket));
}

function clientCommandHandler(socket) {
    return function(command) {
        log.debug(`<${socket.id}> client_command: ${command}`);
        log.debug('emit@everyone: server_command:', command);
        sioEmitter.emit('server_command', command);
    };
}

function clientErrorHandler(socket) {
    return function(err) {
        log.error(`<${socket.id}> error: ${err}`);
    };
}

function clientDisconnectHandler(socket) {
    return function() {
        clients.delete(socket);
        log.debug(`<${socket.id}> disconnect`);
        log.debug(`${clients.size} clients connected connected to this worker`);
    };
}