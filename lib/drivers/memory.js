'use strict';
var _          = require('underscore');
var BaseDriver = require('./base-driver');

class MemoryDriver extends BaseDriver {
    constructor() {
        super();
        this.id = 0;
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
        let self = this;
        let collection = this.collections[modelName];
        return function save(data, callback) {
            data.idd = '5';
            if (data.hasOwnProperty('id')) {
                let match = _.find(collection, function (c) {
                    return c.id === data.id;
                });
                if (match) {
                    for (let key in data) {
                        match[key] = data[key];
                    }
                    return callback();
                }
            }

            data.id = self.id;
            self.id = self.id + 1;
            collection.push(data);
            callback();
        };
    }
    getFindFunc(modelName) {
        let collection = this.collections[modelName];
        return function find(query, start, limit, callback) {
            let results = _.chain(collection)
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
            let results = _.chain(collection)
                .where(query)
                .sortBy((d) => d.timestamp)
                .first()
                .value();
            callback(null, results);
        };
    }
}

module.exports = MemoryDriver;
