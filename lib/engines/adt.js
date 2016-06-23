'use strict';
var Enums      = require('../enums/index');
var models     = require('../models/index');
var random     = require('../helpers/random');
var BaseEngine = require('./base-engine');

class ADTEngine extends BaseEngine {
    constructor(options={}, defaultMessageOptions) {
        super(options, defaultMessageOptions);
        this.options.newPatientProbability = options.newPatientProbability || 10;
        if (this.options.newPatientProbability > 100 || this.options.newPatientProbability < 1 ||
            typeof this.options.newPatientProbability !== 'number') {
            throw new Error('new PatientProbability must be a number between 1 and 100');
        }
    }
    getRandom() {
        let events = Object.keys(Enums.MessageType.ADT);
        let event = random.selectRandom(events);

        let message = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: event
        });
        let visit = new models.visit();
        message.add(new models.patient(visit.account).toSegment());
        message.add(visit.toSegment());
        return message.toString();
    }
    getNextMessage(callback) {
        let self = this;
        switch (this.options.mode) {
            case Enums.Mode.Simulated: {
                let getNewPatient = shouldUseExisting(this.options.newPatientProbability);
                this.getAvailablePatient(getNewPatient, function (error, patient, visit) {
                    if (error) {
                        return callback(error);
                    }

                    self.getNextEvent(patient, visit, function (eventError, event) {
                        if (eventError) {
                            return callback(eventError);
                        }

                        self.generateMessage(patient, visit, event, function (generateError, message) {
                            if (generateError) {
                                return callback(generateError);
                            }
                            let messageEntry = new self.driver.models.message({
                                mrn: patient.mrn,
                                account: visit.account,
                                type: 'ADT',
                                event: event,
                                hl7: message,
                                timestamp: Date.now()
                            });

                            messageEntry.save(function (messageError) {
                                if (messageError) {
                                    return callback(messageError);
                                }
                                callback(null, message);
                            });
                        });
                    });
                });
            }
                break;
            default:
                return callback(null, this.getRandom.call(this));
        }
    }
    getNextEvent(patient, visit, callback) {
        // TODO: Randomly get A17's for two patients (i.e. get a different patient that's admitted)
        // TODO: Randomly get A18's for patients
        let query = {
            mrn: patient.mrn,
            account: visit.account,
            type: 'ADT',
            event: { nin: [ 'A08', 'A19', 'A20', 'A28', 'A29', 'A31' ] }
        };
        this.driver.models.message.findOne(query, function (error, message) {
            if (error) {
                return callback(error);
            }

            if (message) {
                return callback(null, random.event.adt(message.event));
            }
            callback(null, random.event.adt());
        });
    }
    generateMessage(patient, visit, event, callback) {
        let builder = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: event
        });

        switch (event.toUpperCase()) {
            case 'A01':
                visit.setAdmitDate(new Date());
                return visit.save(generateMessage);
            case 'A02':
                this.getNewLocation(function (error, location) {
                    if (error) {
                        return callback(error);
                    }
                    visit.setLocation(location);
                    return visit.save(generateMessage);
                });
                break;
            case 'A03':
            case 'A07': // what does an a07 do exactly..?
                visit.setDischargeDate(new Date());
                return visit.save(generateMessage);
            case 'A04':
                visit.setAdmitDate(null);
                visit.clearLocation();
                visit.patientClass = Enums.PatientClass.Outpatient;
                return visit.save(generateMessage);
            case 'A05':
                visit.setAdmitDate(null);
                visit.clearLocation();
                visit.patientClass = Enums.PatientClass.Preadmit;
                return visit.save(generateMessage);
            case 'A06':
                visit.setAdmitDate();
                visit.setRandomLocation();
                visit.patientClass = Enums.PatientClass.Inpatient;
                return visit.save(generateMessage);
            case 'A11':
                if (visit.admitDate) {
                    visit.setAdmitDate(null);
                    return visit.save(generateMessage);
                }
                return generateMessage();
            case 'A12':
                visit.setLocation(visit.previousLocation);
                return visit.save(generateMessage);
            case 'A13':
                visit.setDischargeDate(null);
                return visit.save(generateMessage);
            default:
                return generateMessage();
        }

        function generateMessage(error) {
            if (error) {
                return callback(error);
            }
            builder.add(patient.toSegment(visit.account));
            builder.add(visit.toSegment());

            return callback(null, builder.toString());
        }
    }
    getNewLocation(location, callback) {
        if (typeof location === 'function') {
            callback = location;
            location = random.visit.location();
        }

        let self = this;
        this.driver.models.visit.count({
            dischargeDate: { exists: false },
            location: {
                nurse: location.nurse,
                room: location.room,
                bed: location.bed
            }
        }, function (error, count) {
            if (error) {
                return callback(error);
            }
            if (count === 0) {
                return callback(null, location);
            }
            self.getNewLocation.call(self, callback);
        });
    }
}

function shouldUseExisting(newPatientProbability) {
    let max = 100 / newPatientProbability;
    return random.getRandomInteger(0, max) !== 0;
}

module.exports = ADTEngine;
