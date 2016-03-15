'use strict';
require('./lib/projectEnv');
const assert = projectEnv.assert;
const bcrypt = projectEnv.bcrypt;
const cluster = projectEnv.cluster;
const db = projectEnv.db;
const express = projectEnv.express;
const fork = projectEnv.fork;
const http = projectEnv.http;
const log = projectEnv.log;
const sio = projectEnv.socket.io;
const emit = projectEnv.emit;
const dbConnectionString = 'mongodb://localhost/node_test';
const clients = projectEnv.clients;

const app = express();
app.use(express.static('public'));
const httpServer = http.Server(app);
const io = sio(httpServer);
projectEnv.io = io;

db.connect(dbConnectionString)
.then(function(db) {
    log.debug('connected to:', dbConnectionString);
    io.on('connection', registerClient);
    httpServer.listen(3000, function(){
        log.debug('listening on *:3000');
    });
})
.catch(err => {
    log.error(err);
    process.exit(1);
});

function registerClient(socket) {
    const time = process.hrtime();
    const singletonRoom = `${time[0].toString(16)}${time[1].toString(16)}`;
    log.debug(`#${singletonRoom} connected`);
    clients.add(socket);
    log.debug(`${clients.size} clients connected`);
    socket.on('error', err => {
        throw err;
    });
    socket.on('client_command', clientCommandHandler(socket));
    socket.on('disconnect', clientDisconnectHandler(socket));
    socket.join(singletonRoom);
    socket.room = singletonRoom;
    socket.controller = 'init.name';
    projectEnv.controllers.init.name_init({
        client: socket,
    });
}

function clientCommandHandler(client) {
    return function(command) {
        log.debug(`#${client.room} client_command@${client.controller}: ${command}`);
        const controllerSplit = client.controller.split('.');
        const controller = controllerSplit[0];
        const action = controllerSplit[1];
        projectEnv.controllers[controller][action]({
            client: client,
            command_type: 'client_command',
            command: command,
        });
    };
}

function clientErrorHandler(client) {
    return function(err) {
        log.error(`<${client.id}> error: ${err}`);
    };
}

function clientDisconnectHandler(client) {
    return function() {
        clients.delete(client);
        log.debug(`#${client.room} disconnected`);
        log.debug(`${clients.size} clients connected connected`);
    };
}