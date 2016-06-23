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
    getTransformedQuery(query) {
        return function filter(obj) {
            for (let key in query) {
                if (!query[key]) {
                    if (obj.hasOwnProperty(key) && obj[key]) {
                        return false;
                    }
                } else if (query[key].constructor === Object) {
                    for (let innerKey in query[key]) {
                        if (anyInnerComparisonFails(obj, key, innerKey)) {
                            return false;
                        }
                    }
                } else if (query[key] !== obj[key]) {
                    return false;
                }
            }
            return true;
        };
        function anyInnerComparisonFails(obj, key, innerKey) {
            let innerValue = query[key][innerKey];

            if (innerKey === 'ne') {
                return (obj[key] || '') === innerValue;
            }
            if (innerKey === 'exists') {
                if (innerValue && (obj.hasOwnProperty(key) === false || obj[key] === null)) {
                    return true;
                } else if (innerValue === false && obj.hasOwnProperty(key) && obj[key] !== null) {
                    return true;
                }
                return false;
            }
            if (innerKey === 'in' || innerKey === 'nin') {
                if (!obj[key]) {
                    return true;
                }
                let contains = query[key][innerKey].indexOf(obj[key]) !== -1;
                let isNotKey = innerKey === 'nin';
                return contains === isNotKey;
            }

            return innerValue !== obj[key][innerKey];
        }
    }
    getSaveFunc(modelName) {
        let self = this;
        let collection = this.collections[modelName];
        return function save(data, callback) {
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
        return function find(queryFilter, start, limit, callback) {
            let results = _.chain(collection)
                .filter(queryFilter)
                .sortBy((d) => d.timestamp)
                .rest(start)
                .first(limit)
                .value();
            callback(null, results);
        };
    }
    getFindOneFunc(modelName) {
        let collection = this.collections[modelName];
        return function findOne(queryFilter, callback) {
            let results = _.chain(collection)
                .filter(queryFilter)
                .sortBy((d) => d.timestamp)
                .reverse()
                .first()
                .value();
            callback(null, results);
        };
    }
    getCountFunc(modelName) {
        let collection = this.collections[modelName];
        return function getCount(queryFilter, callback) {
            let count = _.filter(collection, queryFilter).length;
            callback(null, count);
        };
    }
}

module.exports = MemoryDriver;
