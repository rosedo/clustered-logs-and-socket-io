'use strict';
const express = projectEnv.express;
const cluster = projectEnv.cluster;
const net = projectEnv.net;
const log = projectEnv.log;
const port = 3000;
const processCount = projectEnv.os.cpus().length;

module.exports = function(options, callback) {
    const port = options.port;
    const processCount = options.processCount;
    if (cluster.isMaster) {
        var workers = [];
        var spawn = function(i) {
            workers[i] = cluster.fork();
            workers[i].on('exit', function(worker, code, signal) {
                log.error(`worker ${i} died, restarting…`);
                spawn(i);
            });
        };
        for (var i = 0; i < processCount; i++) {
            spawn(i);
        }
        const hash = function(str) {
            var hash = 5381;
            var i = str.length;
            while(i) {
                hash = (hash * 33) ^ str.charCodeAt(--i);
            }
            return hash >>> 0;
        };
        const worker_index = (ip, len) => hash(ip) % len;
        var server = net.createServer({ pauseOnConnect: true }, function(connection) {
            var worker = workers[worker_index(connection.remoteAddress, processCount)];
            worker.send('sticky-session:connection', connection);
        }).listen(port);
    } else {
        callback(function(server) {
            process.on('message', function(message, connection) {
                if (message !== 'sticky-session:connection') {
                    return;
                }
                server.emit('connection', connection);
                connection.resume();
            });
        });
    }
};