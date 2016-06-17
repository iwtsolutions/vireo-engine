'use strict';
/* eslint-disable no-invalid-this */
var _            = require('underscore');
var models       = require('../models/index');
var EventEmitter = require('events').EventEmitter;

class BaseDriver extends EventEmitter {
    constructor() {
        super();
        if (new.target === BaseDriver) {
            throw new TypeError('Cannot construct BaseDriver instances directly');
        }
        if (this.initializeCollections === undefined) {
            throw new Error('Must override the "initializeCollections" method');
        }
        if (this.getSaveFunc === undefined) {
            throw new Error('Must override the "getSaveFunc" method');
        }
        if (this.getFindFunc === undefined) {
            throw new Error('Must override the "getFindFunc" method');
        }
        if (this.getFindOneFunc === undefined) {
            throw new Error('Must override the "getFindOneFunc" method');
        }

        let self = this;
        setImmediate(function () {
            self.initializeCollections(models, function (error) {
                if (error) {
                    return self.emit('error', error);
                }
                self.models = {};
                Object.keys(models).forEach(function (m) {
                    self.models[m] = {
                        find: getFindFunc.call(self, m, models[m]),
                        findOne: getFindOneFunc.call(self, m, models[m]),
                        save: getSaveFunc.call(self, m, models[m])
                    };
                });
                self.emit('ready');
            });
        });
    }
}

function getSaveFunc(modelName, model) {
    let save = this.getSaveFunc(modelName);
    return function (data, callback) {
        data.timestamp = Date.now();
        let result = _.extend({}, data);
        Object.keys(result).forEach(function (k) {
            if (typeof result[k] === 'function') {
                delete result[k];
            }
        });

        validateModel(model, result, function (validationError) {
            if (validationError) {
                return callback(validationError);
            }
            save(result, callback);
        });
    };
}

function getFindFunc(modelName, model) {
    let find = this.getFindFunc(modelName);
    let save = getSaveFunc.call(this, modelName, model);

    return function (query, start, limit, callback) {
        if (typeof start === 'function') {
            callback = start;
            start = 0;
            limit = 10;
        }
        if (typeof limit === 'function') {
            callback = limit;
            limit = 10;
        }
        find(query, start, limit, function (error, results) {
            if (error) {
                return callback(error);
            }
            results.forEach(function (r) {
                r.save = (cb) => save(r, cb);
            });
            callback(null, results);
        });
    };
}

function getFindOneFunc(modelName, model) {
    let findOne = this.getFindOneFunc(modelName);
    let save = getSaveFunc.call(this, modelName, model);

    return function (query, callback) {
        findOne(query, function (error, result) {
            if (error) {
                return callback(error);
            }
            if (!result) {
                return callback();
            }
            result.save = (cb) => save(result, cb);
            callback(null, result);
        });
    };
}

function validateModel(model, data, callback) {
    let missingKeys = [];
    Object.keys(model).forEach(function (key) {
        if (model[key].required && data.hasOwnProperty(key) === false) {
            missingKeys.push(key);
        }
    });
    if (missingKeys.length > 0) {
        return callback(new Error('Must provided required keys: ' + missingKeys));
    }
    callback();
}

module.exports = BaseDriver;
