'use strict';
/* eslint-disable no-invalid-this */
var _            = require('underscore');
var models       = require('../models/index');
var random       = require('../helpers/random');
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
        if (this.getCountFunc === undefined) {
            throw new Error('Must override the "getCountFunc" method');
        }

        let self = this;
        setImmediate(function () {
            self.initializeCollections(models, function (error) {
                if (error) {
                    return self.emit('error', error);
                }
                self.models = {};
                Object.keys(models).forEach(function (modelName) {
                    self.models[modelName] = models[modelName];
                    self.models[modelName].find = getFindFunc.call(self, modelName);
                    self.models[modelName].findOne = getFindOneFunc.call(self, modelName);
                    self.models[modelName].save = getSaveFunc.call(self, modelName, models[modelName].schema);
                    self.models[modelName].count = getCountFunc.call(self, modelName);
                    self.models[modelName].findRandom = getFindRandomFunc.call(self, modelName);
                    self.models[modelName].prototype.save = function (callback) {
                        self.models[modelName].save(this, callback);
                    };
                });
                self.emit('ready');
            });
        });
    }
}

function getSaveFunc(modelName, schema) {
    let save = this.getSaveFunc(modelName);
    return function (data, callback) {
        data.timestamp = Date.now();
        let result = _.extend({}, data);
        Object.keys(result).forEach(function (k) {
            if (typeof result[k] === 'function') {
                delete result[k];
            }
        });

        validateModel(schema, result, function (validationError) {
            if (validationError) {
                return callback(validationError);
            }
            save(result, function (error) {
                if (result.hasOwnProperty('id')) {
                    // Attach id back to original object.
                    data.id = result.id;
                    data.timestamp = result.timestamp;
                }
                callback(error);
            });
        });
    };
}

function getFindFunc(modelName) {
    let self = this;
    let find = this.getFindFunc(modelName);

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
            var modelResults = [];
            results.forEach(function (r) {
                modelResults.push(new self.models[modelName](r));
            });
            callback(null, modelResults);
        });
    };
}

function getFindOneFunc(modelName) {
    let self = this;
    let findOne = this.getFindOneFunc(modelName);

    return function (query, callback) {
        findOne(query, function (error, result) {
            if (error) {
                return callback(error);
            }
            if (!result) {
                return callback();
            }
            result = new self.models[modelName](result);
            callback(null, result);
        });
    };
}

function getFindRandomFunc(modelName) {
    let getCount = getCountFunc.call(this, modelName);
    let find = getFindFunc.call(this, modelName);

    return function (query, callback) {
        if (typeof query === 'function') {
            callback = query;
            query = {};
        }
        getCount(query, function (error, count) {
            if (error) {
                return callback(error);
            }
            let skip = random.getRandomInteger(0, count);
            find(query, skip, 1, function (findError, results) {
                if (findError) {
                    return callback(findError);
                }
                callback(null, results[0]);
            });
        });
    };
}

function getCountFunc(modelName) {
    let getCount = this.getCountFunc(modelName);

    return function (query, callback) {
        if (typeof query === 'function') {
            callback = query;
            query = {};
        }
        getCount(query, function (error, count) {
            if (error) {
                return callback(error);
            }
            callback(null, count);
        });
    };
}

function validateModel(schema, data, callback) {
    let missingKeys = [];
    Object.keys(schema).forEach(function (key) {
        if (schema[key].required && data.hasOwnProperty(key) === false) {
            missingKeys.push(key);
        }
    });
    if (missingKeys.length > 0) {
        return callback(new Error('Must provided required keys: ' + missingKeys));
    }
    callback();
}

module.exports = BaseDriver;
