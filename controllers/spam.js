'use strict';
const log = projectEnv.log;
const middlewares = projectEnv.middlewares;
const emit = projectEnv.emit;
const db = projectEnv.db;

module.exports = {
    spam: spam,
    spam_init: spam_init,
};

function spam_init(arg) {
    emit.one('event', arg.client, 'init.spam_init');
    const user = arg.user;
    emit.one(user, `Bienvenue sur le salon, ${user.name}.`);
}

function spam(arg) {
    middlewares.trim(arg);
    middlewares.login(arg)
    .then(() => {
        const user = arg.user;
        emit.allActive(`[${user.name}] ${arg.command}`);
    });
}