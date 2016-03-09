'use strict';

const projectEnv = {};
global.projectEnv = projectEnv;

// step 1
const log = require('log');
const logOptions = {
    level: 'debug',
    colorize: true,
    timestamp: true,
    prettyPrint: true,
};
const logFileOptions = Object.assign({}, logOptions, {
    filename: __dirname + '/../log/debug.log',
    maxsize: 64 * 1024 * 1024,
    json: false,
    tailable: true,
    maxFiles: 10,
    zippedArchive: true,
});
log.remove(log.transports.Console);
log.add(log.transports.Console, logOptions);
log.add(log.transports.File, logFileOptions);
projectEnv.setLogLabel = function(label) {
    try {
        log.remove(log.transports.Console);
    } catch(err) {}
    log.add(log.transports.Console, Object.assign({}, logOptions, { label: label }));    
    try {
        log.remove(log.transports.File);
    } catch(err) {}
    log.add(log.transports.File, Object.assign({}, logFileOptions, { label: label }));    
};

// step 2
projectEnv.assert = require('assert');
projectEnv.cluster = require('cluster');
projectEnv.express = require('express');
projectEnv.net = require('net');
projectEnv.mongodb = require('mongodb');
projectEnv.MongoClient = projectEnv.mongodb.MongoClient;
projectEnv.os = require('os');
projectEnv.http = require('http');
projectEnv.log = log;
projectEnv.socket = {
    io: require('socket.io'),
    ioRedis: require('socket.io-redis'),
    ioEmitter: require('socket.io-emitter'),
};

// step 3
projectEnv.db = require('./db');
projectEnv.fork = require('./fork');

// data
projectEnv.clients = new Set();