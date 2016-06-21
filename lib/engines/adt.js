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
        this.getNextMessage.call(this, function (error, message) {
            if (error) {
                self.emit('error', error);
            }
            self.emit('message', message);
            setTimeout(self.sendNextMessage.bind(self), self.getTimeout());
        });
    }
    getNextMessage(callback) {
        let self = this;
        switch (this.options.mode) {
            case Enums.Mode.Simulated: {
                this.getAvailablePatient(shouldUseExisting(), function (error, patient, visit) {
                    if (error) {
                        return callback(error);
                    }

                    self.getNextEvent(patient, visit, function (eventError, event) {
                        if (eventError) {
                            return callback(eventError);
                        }

                        let message = self.generateMessage(patient, visit, event);

                        let messageEntry = new self.driver.models.message({
                            mrn: patient.mrn,
                            account: visit.account,
                            type: 'ADT',
                            event: event,
                            hl7: message,
                            timestamp: Date.now()
                        });

                        // TODO: Implement something to gurantee that a message has been sent.
                        messageEntry.save(function (messageError) {
                            if (messageError) {
                                return callback(messageError);
                            }
                            callback(null, message);
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
        let updateEvents = [ 'A08', 'A31' ];

        // TODO: Use a better way to find non-update events. If 10 of the last messages were
        //      A08's or A31's, then this will essentially fail..
        var query = { mrn: patient.mrn, account: visit.account, type: 'ADT' };
        this.driver.models.message.find(query, function (error, messages) {
            if (error) {
                return callback(error);
            }

            for (var key in messages) {
                if (updateEvents.indexOf(messages[key].event) === -1) {
                    return callback(null, random.event.adt(messages[key].event));
                }
            }
            callback(null, random.event.adt());
        });
    }
    generateMessage(patient, visit, event) {
        let builder = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: event
        });

        // TODO: Change stuff based on event
        builder.add(patient.toSegment());
        builder.add(visit.toSegment());

        return builder.toString();
    }
}

function shouldUseExisting() {
    return random.getRandomInteger(1, 10) !== 1;
}

module.exports = ADTEngine;
