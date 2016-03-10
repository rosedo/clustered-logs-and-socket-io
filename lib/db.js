'use strict';
const MongoClient = projectEnv.MongoClient;
const assert = projectEnv.assert;
const log = projectEnv.log;
var db = null;

module.exports = {
    connect: connect,
    aggregate: aggregate,
    bulkWrite: bulkWrite,
    count: count,
    createIndex: createIndex,
    createIndexes: createIndexes,
    deleteMany: deleteMany,
    deleteOne: deleteOne,
    distinct: distinct,
    drop: drop,
    dropIndex: dropIndex,
    dropIndexes: dropIndexes,
    ensureIndex: ensureIndex,
    findCursor: findCursor,
    findAll: findAll,
    findOne: findOne,
    findOneAndDelete: findOneAndDelete,
    findOneAndReplace: findOneAndReplace,
    findOneAndUpdate: findOneAndUpdate,
    geoHaystackSearch: geoHaystackSearch,
    geoNear: geoNear,
    group: group,
    indexes: indexes,
    indexExists: indexExists,
    indexInformation: indexInformation,
    insertMany: insertMany,
    insertOne: insertOne,
    isCapped: isCapped,
    listIndexesCursor: listIndexesCursor,
    mapReduce: mapReduce,
    options: options,
    parallelCollectionScan: parallelCollectionScan,
    reIndex: reIndex,
    rename: rename,
    replaceOne: replaceOne,
    save: save,
    stats: stats,
    updateMany: updateMany,
    updateOne: updateOne,
};

function connect() {
    const args = Array.prototype.slice.call(arguments);
    return new Promise((resolve, reject) => {
        args.push((err, db_) => err ? reject(err) : resolve(module.exports.db = db = db_));
        MongoClient.connect.apply(null, args);
    });
}

// http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html

function aggregate(model, pipeline, options) {
    return new Promise((resolve, reject) => {
        db.collection(model).aggregate(pipeline, options, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
}

function bulkWrite() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).bulkWrite.apply(db, args);
}

function count(model, query, options) {
    if (typeof options === 'undefined') {
        options = null;
    }
    return db.collection(model).count(query, options);
}

function createIndex() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).createIndex.apply(db, args);
}

function createIndexes() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).createIndexes.apply(db, args);
}

function deleteMany(model, filter, options) {
    if (typeof options === 'undefined') {
        options = null;
    }
    return db.collection(model).deleteMany(filter, options);
}

function deleteOne(model, filter, options) {
    if (typeof options === 'undefined') {
        options = null;
    }
    return db.collection(model).deleteOne(filter, options);
}

function distinct() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).distinct.apply(db, args);
}

function drop() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).drop.apply(db, args);
}

function dropIndex() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).dropIndex.apply(db, args);
}

function dropIndexes() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).dropIndexes.apply(db, args);
}

function ensureIndex() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).ensureIndex.apply(db, args);
}

function findCursor(model, query) {
    return db.collection(model).find(query);
}

function findAll(model, query) {
    return db.collection(model).find(query).toArray();
}

function findOne(model, query, options) {
    if (typeof options === 'undefined') {
        options = {};
    }
    return db.collection(model).findOne(query, options);
}

function findOneAndDelete() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).findOneAndDelete.apply(db, args);
}

function findOneAndReplace() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).findOneAndReplace.apply(db, args);
}

function findOneAndUpdate() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).findOneAndUpdate.apply(db, args);
}

function geoHaystackSearch() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).geoHaystackSearch.apply(db, args);
}

function geoNear() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).geoNear.apply(db, args);
}

function group() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).group.apply(db, args);
}

function indexes() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).indexes.apply(db, args);
}

function indexExists() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).indexExists.apply(db, args);
}

function indexInformation() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).indexInformation.apply(db, args);
}

function insertMany() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).insertMany.apply(db, args);
}

function insertOne(model, doc, options) {
    if (typeof options === 'undefined') {
        options = null;
    }
    return db.collection(model).insertOne(doc, options);
}

function isCapped() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).isCapped.apply(db, args);
}

function listIndexesCursor(model, options) {
    return db.collection(model).listIndexes(options);
}

function mapReduce() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).mapReduce.apply(db, args);
}

function options() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).options.apply(db, args);
}

function parallelCollectionScan() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).parallelCollectionScan.apply(db, args);
}

function reIndex() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).reIndex.apply(db, args);
}

function rename() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).rename.apply(db, args);
}

function replaceOne() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).replaceOne.apply(db, args);
}

function save() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).save.apply(db, args);
}

function stats() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).stats.apply(db, args);
}

function updateMany() {
    log.error(new Error('not implemented'));
    // const args = Array.prototype.slice.call(arguments);
    // return db.collection(args.shift()).updateMany.apply(db, args);
}

function updateOne(model, filter, update, options, callback) {
    if (typeof options === 'undefined') {
        options = null;
    }
    return db.collection(model).updateOne(filter, update, options);
}