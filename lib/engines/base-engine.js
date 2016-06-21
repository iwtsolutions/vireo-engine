'use strict';
var _            = require('underscore');
var faker        = require('faker');
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
            receivingFacility: 'Facility X'
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
                return random.getRandomInteger(10000, 20000);
            case Enums.Speed.Medium:
                return random.getRandomInteger(2500, 5000);
            case Enums.Speed.Fast:
                return random.getRandomInteger(500, 1750);
            default:
                return 10;
        }
    }
    getAvailablePatient(type, callback) {
        let self = this;
        switch (type) {
            case 'active':
                this.driver.models.visit.find({ dischargeDate: null }, 0, 50, function (visitError, visits) {
                    if (visitError) {
                        return callback(visitError);
                    }
                    if (visits.length === 0) {
                        // If no visits, get a new visit using default type.
                        return self.getAvailablePatient.call(self, '', callback);
                    }
                    var visit = random.selectRandom(visits);

                    self.driver.models.patient.findOne({ id: visit.patient }, function (patientError, patient) {
                        callback(patientError, patient, false);
                    });
                });
                break;
            default: {
                let patient = {
                    mrn: random.getRandomPatientIdentifier(),
                    name: {
                        family: faker.name.lastName(),
                        given: faker.name.firstName(),
                        middle: random.getRandomCharacters(1)
                    },
                    dob: faker.date.between(new Date('1920-01-01'), new Date()),
                    sex: random.selectRandom([ 'm', 'f', 'u' ])
                };
                this.driver.models.patient.save(patient, function (error) {
                    if (error) {
                        return callback(error);
                    }
                    let visit = {
                        patient: patient.id,
                        class: random.visit.class(),
                        account: random.getRandomPatientIdentifier()
                    };

                    self.driver.models.visit.save(visit, function (visitError) {
                        callback(visitError, patient, true);
                    });
                });
            }
                break;
        }
    }
}

module.exports = BaseEngine;
