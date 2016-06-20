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
        this.sendNextMessage.call(this, mode);
    }
    getRandom() {
        let events = Object.keys(Enums.MessageType.ADT);
        let event = events[Random.getRandomInteger(0, events.length - 1)];

        let message = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: event
        });
        message.add(Segments.PID.random());
        message.add(Segments.PV1.random());
        return message.toString();
    }
    sendNextMessage(mode) {
        switch (mode) {
            default: {
                let message = this.getRandom.call(this);
                this.emit('message', message);
            }
        }
        let timeout = this.getTimeout();
        setTimeout(
            this.sendNextMessage.bind(this, mode),
            timeout
        );
    }
}

module.exports = ADTEngine;
