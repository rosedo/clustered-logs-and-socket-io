'use strict';
const log = projectEnv.log;
const middlewares = projectEnv.middlewares;
const controllers = projectEnv.controllers;
const emit = projectEnv.emit;
const db = projectEnv.db;
const bcrypt = projectEnv.bcrypt;

module.exports = {
    name: name,
    name_init: name_init,
    name_isValid: name_isValid,
    registerPassword: registerPassword,
    registerPassword_init: registerPassword_init,
    registerPassword_isValid: registerPassword_isValid,
    loginPassword: loginPassword,
    loginPassword_init: loginPassword_init,
};

function name_init(arg) {
    emit.one('event', arg.client, 'init.name_init');
    emit.one(arg.client, 'Comment vous appelle-t-on ?');
}

function name(arg) {
    middlewares.trim(arg);
    const client = arg.client;
    if (!name_isValid(arg.command)) {
        emit.one('event', client, 'init.name.invalid_name');
        return emit.one(client, 'Merci de n\'entrer qu\'un à trois mots constitués uniquement de 2 à 15 lettres, séparés par espace ou trait d\'union');
    }
    db.findOne('users', { name: new RegExp(arg.command, 'i') })
    .then(user => {
        client.name = arg.command;
        if (!user) {
            emit.one('event', client, 'init.name.not_found');
            client.controller = 'init.registerPassword';
            return db.updateOne('clients', { id: client.id }, client)
            .then(() => registerPassword_init(arg));
        }
        client.controller = 'init.loginPassword';
        return db.updateOne('clients', { id: client.id }, client)
        .then(() => loginPassword_init(arg));
        emit.one(client, 'Entrez votre mot de passe :');
    });
}

function name_isValid(name) {
    return /^[a-z]{2,15}(( |-)[a-z]{2,15}){0,2}$/i.test(name);
}

function registerPassword_init(arg) {
    const client = arg.client;
    emit.one('event', client, 'init.registerPassword_init');
    emit.one('read', client, 'password');
    emit.one(client, 'Nouveau personnage ! Entrez un mot de passe :');
}

function registerPassword(arg) {
    const client = arg.client;
    if (!registerPassword_isValid(arg.command)) {
        emit.one('event', client, 'init.registerPassword.invalid_password');
        return emit.one(client, 'Merci d\'entrer un mot de passe de 6 à 40 caractères');
    }
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(arg.command, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                const user = {
                    name: client.name,
                    passwordHash: hash,
                    room: client.room,
                };
                return db.insertOne('users', user)
                .then(() => {
                    emit.one('event', user, 'init.registerPassword.user_created');
                    emit.one('event', user, 'init.registerPassword.user_connected');
                    client.controller = 'spam.spam';
                    client.connected = true;
                    arg.user = user;
                    return db.updateOne('clients', { id: client.id }, client);
                })
                .then(() => controllers.spam.spam_init(arg))
                .catch(reject);
            });
        });
    })
    .catch(log.error);
}

function registerPassword_isValid(clearPassword) {
    return /^.{6,40}$/.test(clearPassword);
}

function loginPassword_init(arg) {
    const client = arg.client;
    emit.one('event', client, 'init.registerPassword_init');
    emit.one('read', client, 'password');
    emit.one(client, 'Entrez votre mot de passe :');
}

function loginPassword(arg) {
    const client = arg.client;
    if (!registerPassword_isValid(arg.command)) {
        emit.one('event', client, 'init.loginPassword.invalid_password');
        return emit.one(client, 'Merci d\'entrer un mot de passe de 6 à 40 caractères');
    }
    return db.findOne('users', { name: new RegExp(client.name, 'i') })
    .then(user => new Promise((resolve, reject) => {
        bcrypt.compare(arg.command, user.passwordHash, function(err, res) {
            if (err) {
                return reject(err);
            }
            if (!res) {
                emit.one('event', client, 'init.loginPassword.password_not_matched');
                emit.one(client, 'Mot de passe incorrect');
                return resolve();
            }
            let promise = Promise.resolve();
            if (user.room) {
                promise = db.findOne('clients', { room: user.room })
                .then(client => {
                    if (client) {
                        emit.one('event', user, 'init.loginPassword.double_connection');
                        emit.one(user, 'Ce compte est réquisitionné par une autre session.');
                        client.controller = 'init.name';
                        delete client.connected;
                        return db.updateOne('clients', { _id: client._id }, client)
                        .then(() => name_init({ client: client }));
                    }
                });
            }
            return promise
            .then(() => {
                user.room = client.room;
                return db.updateOne('users', { _id: user._id }, user);
            })
            .then(() => {
                emit.one('event', user, 'init.loginPassword.user_connected');
                client.controller = 'spam.spam';
                client.connected = true;
                arg.user = user;
                return db.updateOne('clients', { _id: client._id }, client)
                .then(() => controllers.spam.spam_init(arg));
            })
            .catch(reject);
        });
    }));
}