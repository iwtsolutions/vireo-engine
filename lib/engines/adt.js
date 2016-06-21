'use strict';
var Enums      = require('../enums/index');
var models     = require('../models/index');
var random     = require('../helpers/random');
var BaseEngine = require('./base-engine');

class ADTEngine extends BaseEngine {
    constructor(options, defaultMessageOptions) {
        super(options, defaultMessageOptions);
    }
    consume() {
        // TODO: Don't start this if it has already started..
        this.sendNextMessage.call(this);
    }
    stop() {
        // TODO: Setup a consumeTimeout variable below
        clearTimeout(this.consumeTimeout);
    }
    getRandom() {
        let events = Object.keys(Enums.MessageType.ADT);
        let event = events[random.getRandomInteger(0, events.length - 1)];

        let message = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: event
        });
        let visit = new models.visit();
        message.add(new models.patient(visit.account).toSegment());
        message.add(visit.toSegment());
        return message.toString();
    }
    sendNextMessage() {
        let self = this;
        let sendNext = function (error) {
            if (error) {
                self.emit('error', error);
            }
            setTimeout(self.sendNextMessage.bind(self), self.getTimeout());
        };

        switch (this.options.mode) {
            case Enums.Mode.Simulated: {
                let patientType = random.selectRandom([ 'active', 'discharged', 'new' ]);
                this.getAvailablePatient(patientType, function (error, patient, isNew) {
                    if (error) {
                        return sendNext(error);
                    }

                    console.log('patient: ', patient);
                    self.getNextEvent(patient, isNew, function (eventError, event) {
                        if (eventError) {
                            return sendNext(eventError);
                        }

                        console.log('event: ', event);
                        let message = self.generateMessage(patient, event);
                        self.emit('message', message);

                        let messageHistory = {
                            mrn: patient.mrn,
                            type: 'ADT',
                            event: event,
                            hl7: message,
                            timestamp: Date.now()
                        };

                        self.driver.models.message.save(messageHistory, function (messageError) {
                            if (messageError) {
                                return sendNext(messageError);
                            }
                            sendNext();
                        });
                    });
                });
            }
                break;
            default: {
                let message = this.getRandom.call(this);
                this.emit('message', message);
                sendNext();
            }
        }
    }
    getNextEvent(patient, isNew, callback) {
        if (isNew) {
            return callback(null, random.event.adt());
        }
        let updateEvents = [ 'A08', 'A31' ];

        // TODO: Randomly get A17's for two patients (i.e. get a different patient that's admitted)
        this.driver.models.message.find(0, function (error, messages) {
            if (error) {
                return callback(error);
            }

            messages.forEach(function (m) {
                console.log('m: ', m);
                if (updateEvents.indexOf(m.event) === -1) {
                    return random.event.adt(m.event);
                }
            });
            callback(null, random.event.adt());
        });
    }
    generateMessage(patient, event) {
        let builder = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: event
        });

        // TODO: Generate PID/PV1 segments..
        return builder.toString();
    }
}

module.exports = ADTEngine;
