'use strict';
var _            = require('underscore');
var Enums        = require('../enums/index');
var random       = require('../helpers/random');
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

        var self = this;
        options = options || {};
        defaultMessageOptions = defaultMessageOptions || {};

        this.options = _.extend({
            speed: Enums.Speed.Slow,
            mode: Enums.Mode.Random
        }, options);
        this.defaultMessageOptions = _.extend({
            application: 'Vireo',
            facility: 'IWT Health',
            messageType: 'ADT',
            version: '2.3',
            receivingApplication: 'Application X',
            receivingFacility: 'Facility X',
            eventSegment: true,
            delimiters: {
                segment: '\n',
                field: '|',
                component: '^',
                repeat: '~',
                escape: '\\',
                subComponent: '&'
            }
        }, defaultMessageOptions);

        if (!this.options.driver) {
            this.options.driver = new Drivers.Memory();
        }
        this.driver = this.options.driver;
        this.driver.once('ready', function () {
            self.emit('ready');
        });
    }
    getMessageBuilder(messageOptions) {
        let options = _.extend(this.defaultMessageOptions, messageOptions || {});

        return new Builder.Message({
            messageType: options.messageType,
            messageEvent: options.messageEvent,    // Required
            eventSegment: options.eventSegment,
            delimiters: options.delimiters,
            sendingApplication: options.application,
            sendingFacility: options.facility,
            receivingApplication: options.receivingApplication,
            receivingFacility: options.receivingFacility,
            messageId: options.messageId,
            version: options.version
        });
    }
    getTimeout() {
        switch (this.options.speed) {
            case Enums.Speed.Slow:
                return random.getRandomInteger(10000, 20000);
            case Enums.Speed.Medium:
                return random.getRandomInteger(2500, 5000);
            case Enums.Speed.Fast:
                return random.getRandomInteger(500, 1750);
            default:
                return 10;
        }
    }
    getAvailablePatient(existing, callback) {
        let self = this;

        if (typeof existing === 'function') {
            callback = existing;
            existing = false;
        }

        if (existing) {
            this.driver.models.visit.findRandom({ dischargeDate: { exists: false } }, function (visitError, visit) {
                if (visitError) {
                    return callback(visitError);
                }
                if (!visit) {
                    // If no visits, get a new visit using default type.
                    return self.getAvailablePatient.call(self, false, callback);
                }

                self.driver.models.patient.findOne({ id: visit.patientId }, function (patientError, patient) {
                    callback(patientError, patient, visit);
                });
            });
        } else {
            let patient = new this.driver.models.patient();
            patient.save(function (error) {
                if (error) {
                    return callback(error);
                }

                let visit = new self.driver.models.visit({
                    patientId: patient.id
                });
                visit.save(function (visitError) {
                    callback(visitError, patient, visit);
                });
            });
        }
    }
}

module.exports = BaseEngine;
