'use strict';
const _ = projectEnv._;
const log = projectEnv.log;
const db = projectEnv.db;
const clients = projectEnv.clients;

module.exports = {
    one: one,
    to: to,
    all: all,
    allActive: allActive,
};

function all() {
    let type = 'server_command';
    let message = arguments[0];
    if (arguments.length >= 2) {
        type = arguments[0];
        message = arguments[1];
    }
    to(type, clients, message);
}

function allActive() {
    let type = 'server_command';
    let message = arguments[0];
    if (arguments.length >= 2) {
        type = arguments[0];
        message = arguments[1];
    }
    const connected = _.filter(clients, client => client.connected);
    to(type, connected, message);
}

function one() {
    let type = 'server_command';
    let room = arguments[0];
    let message = arguments[1];
    if (arguments.length >= 3) {
        type = arguments[0];
        room = arguments[1];
        message = arguments[2];
    }
    if (typeof room === 'object' && room.room) {
        room = room.room;
    }
    log.debug(`#${room}: ${type}:`, message);
    projectEnv.io.to(room).emit(type, message);
}

function to() {
    let type = 'server_command';
    let rooms = arguments[0];
    let message = arguments[1];
    if (arguments.length >= 3) {
        type = arguments[0];
        rooms = arguments[1];
        message = arguments[2];
    }
    if (!rooms.length) {
        return;
    }
    rooms = rooms.map(room => {
        return (typeof room === 'object' && room.room) ? room.room : room;
    });
    log.debug(`#${rooms.join(',')}: ${type}:`, message);
    rooms.forEach(room => {
        projectEnv.io.to(room).emit(type, message);
    });
}