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
    save(collection, data, callback) {
        this.collections[collection].push(data);
        callback();
    }
    find(collection, query, start, limit, callback) {
        var results = _.chain(this.collections[collection])
            .where(query)
            .sortBy((d) => d.timestamp)
            .rest(start)
            .first(limit)
            .value();
        callback(null, results);
    }
}

module.exports = MemoryDriver;
