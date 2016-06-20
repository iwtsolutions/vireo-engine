'use strict';
var _            = require('underscore');
var Enums        = require('../enums/index');
var Random       = require('../helpers/random');
var Builder      = require('hl7-builder');
var Drivers      = require('../drivers/index');
var EventEmitter = require('events').EventEmitter;

class BaseEngine extends EventEmitter {
    constructor(options, defaultMessageOptions) {
        super();
        if (new.target === BaseEngine) {
            throw new TypeError('Cannot construct BaseEngine instances directly');
        }
        if (this.consume === undefined) {
            throw new Error('Must override the "consume" method');
        }
        if (this.getRandom === undefined) {
            throw new Error('Must override the "getRandom" method');
        }

        options = options || {};
        defaultMessageOptions = defaultMessageOptions || {};

        this.options = _.extend({
            speed: Enums.Speed.Slow,
            mode: Enums.Mode.Random,
            storageDriver: Drivers.Memory
        }, options);
        this.defaultMessageOptions = _.extend({
            application: 'Vireo',
            facility: 'IWT Health',
            messageType: 'ADT',
            version: '2.3',
            receivingApplication: 'Application X',
            receivingFacility: 'Facility X'
        }, defaultMessageOptions);
    }
    getMessageBuilder(messageOptions) {
        let options = _.extend(this.defaultMessageOptions, messageOptions || {});

        return new Builder.Message({
            messageType: options.messageType,
            messageEvent: options.messageEvent,    // Required
            eventSegment: true,
            delimiters: {
                segment: '\n'
                // field, component, repeat, escape, subComponent (unused)
            },
            sendingApplication: options.application,
            sendingFacility: options.facility,
            receivingApplication: options.receivingApplication,
            receivingFacility: options.receivingFacility,
            messageId: Math.floor((Math.random() * 1000) + 1),
            version: options.version
        });
    }
    getTimeout() {
        switch (this.options.speed) {
            case Enums.Speed.Slow:
                return Random.getRandomInteger(10000, 20000);
            case Enums.Speed.Medium:
                return Random.getRandomInteger(2500, 5000);
            case Enums.Speed.Fast:
                return Random.getRandomInteger(500, 1750);
            default:
                return 10;
        }
    }
}

module.exports = BaseEngine;
