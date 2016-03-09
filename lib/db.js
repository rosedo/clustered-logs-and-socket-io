'use strict';
const MongoClient = projectEnv.MongoClient;
const assert = projectEnv.assert;
const log = projectEnv.log;

module.exports = {
    connect: connect,
};

function connect() {
    const args = [].slice.call(arguments);
    return new Promise((resolve, reject) => {
        args.push((err, db) => err ? reject(err) : resolve(db));
        MongoClient.connect.apply(null, args);
    });
}