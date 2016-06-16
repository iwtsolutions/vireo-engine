'use strict';
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
        if (this.save === undefined) {
            throw new Error('Must override the "save" method');
        }
        if (this.find === undefined) {
            throw new Error('Must override the "find" method');
        }

        let self = this;
        setImmediate(function () {
            self.initializeCollections(models, function (error) {
                if (error) {
                    return self.emit('error', error);
                }
                self.emit('ready');
            });
        });
    }
    saveMessage(mrn, account, type, hl7, callback) {
        this.save('messages', {
            mrn: mrn,
            account: account,
            type: type,
            hl7: hl7,
            timestamp: new Date()
        }, callback);
    }
    getMessageHistory(query, start, limit, callback) {
        if (typeof start === 'function') {
            callback = start;
            start = 0;
            limit = 10;
        }
        if (typeof limit === 'function') {
            callback = limit;
            limit = 10;
        }
        this.find('messages', query, start, limit, callback);
    }
}

module.exports = BaseDriver;
