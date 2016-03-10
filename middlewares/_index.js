'use strict';
const db = projectEnv.db;
const log = projectEnv.log;

module.exports = {
    trim: trim,
    login: login,
};

function trim(arg) {
    arg.command = arg.command.trim();
}

function login(arg) {
    return db.findOne('users', { room: arg.client.room })
    .then(user => arg.user = user);
}