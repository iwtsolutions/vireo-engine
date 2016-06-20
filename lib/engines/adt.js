'use strict';
var Enums      = require('../enums/index');
var Random     = require('../helpers/random');
var Segments   = require('./segments/index');
var BaseEngine = require('./base-engine');

class ADTEngine extends BaseEngine {
    constructor(options) {
        super(options);
    }
    consume(mode) {
        if (mode === Enums.Mode.Random) {
            // TODO: Generate random messages
        }
    }
    getRandom() {
        var events = Object.keys(Enums.MessageType.ADT);
        var event = events[Random.getRandomInteger(0, events.length - 1)];

        var message = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: event
        });
        message.add(Segments.PID.random());
        message.add(Segments.PV1.random());
        return message.toString();
    }
}

module.exports = ADTEngine;
