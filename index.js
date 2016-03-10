'use strict';
require('./lib/projectEnv');
const assert = projectEnv.assert;
const bcrypt = projectEnv.bcrypt;
const cluster = projectEnv.cluster;
const db = projectEnv.db;
const express = projectEnv.express;
const fork = projectEnv.fork;
const log = projectEnv.log;
const sio = projectEnv.socket.io;
const sioRedis = projectEnv.socket.ioRedis;
const emit = projectEnv.emit;
const dbConnectionString = 'mongodb://localhost/node_test';
const workerClients = new Set();

fork({
    port: 3000,
    processCount: projectEnv.os.cpus().length,
}, function(callback) {
    projectEnv.setLogLabel('worker' + cluster.worker.id);
    db.connect(dbConnectionString)
    .then(function(db_) {
        db.deleteMany('clients', {});
        return db_;
    })
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
    .catch(err => {
        log.error(err);
        process.exit(1);
    });
});

function registerClient(socket) {
    const time = process.hrtime();
    const singletonRoom = `${time[0].toString(16)}${time[1].toString(16)}`;
    log.debug(`#${singletonRoom} connected`);
    workerClients.add(socket);
    log.debug(`${workerClients.size} clients connected to this worker`);
    socket.on('error', err => {
        throw err;
    });
    socket.on('client_command', clientCommandHandler(socket));
    socket.on('disconnect', clientDisconnectHandler(socket));
    socket.join(singletonRoom);
    const client = {
        id: socket.id,
        room: singletonRoom,
        controller: 'init.name',
    };
    db.insertOne('clients', client)
    .then(() => db.count('clients'))
    .then(count => log.debug(`${count} clients connected`))
    .catch(log.error)
    .then(function() {
        projectEnv.controllers.init.name_init({
            socket: socket,
            client: client,
        });
    });
}

function clientCommandHandler(socket) {
    return function(command) {
        db.findOne('clients', { id: socket.id })
        .then(client => {
            log.debug(`#${client.room} client_command@${client.controller}: ${command}`);
            const controllerSplit = client.controller.split('.');
            const controller = controllerSplit[0];
            const action = controllerSplit[1];
            projectEnv.controllers[controller][action]({
                socket: socket,
                client: client,
                command_type: 'client_command',
                command: command,
            });
        });
    };
}

function clientErrorHandler(socket) {
    return function(err) {
        log.error(`<${socket.id}> error: ${err}`);
    };
}

function clientDisconnectHandler(socket) {
    return function() {
        workerClients.delete(socket);
        db.findAll('clients', { id: socket.id })
        .then(clients => {
            log.debug(`#${clients[0].room} disconnected`);
            log.debug(`${workerClients.size} clients connected connected to this worker`);
            return db.deleteOne('clients', { id: socket.id });
        })
        .then(() => db.count('clients'))
        .then(count => log.debug(`${count} clients connected`));
    };
}