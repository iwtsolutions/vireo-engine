'use strict';
var _          = require('underscore');
var BaseDriver = require('./base-driver');

class MemoryDriver extends BaseDriver {
    constructor() {
        super();
    }
    initializeCollections(models, callback) {
        let self = this;
        self.collections = {};
        Object.keys(models).forEach(function (m) {
            self.collections[m] = [];
        });
        callback();
    }
    getSaveFunc(modelName) {
        let collection = this.collections[modelName];
        return function save(data, callback) {
            collection.push(data);
            callback();
        };
    }
    getFindFunc(modelName) {
        let collection = this.collections[modelName];
        return function find(query, start, limit, callback) {
            var results = _.chain(collection)
                .where(query)
                .sortBy((d) => d.timestamp)
                .rest(start)
                .first(limit)
                .value();
            callback(null, results);
        };
    }
    getFindOneFunc(modelName) {
        let collection = this.collections[modelName];
        return function findOne(query, callback) {
            var results = _.chain(collection)
                .where(query)
                .sortBy((d) => d.timestamp)
                .first()
                .value();
            callback(null, results);
        };
    }
}

module.exports = MemoryDriver;
