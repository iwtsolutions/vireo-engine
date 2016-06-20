'use strict';
var Enums      = require('../enums/index');
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
    generateRandomMessage() {
        var message = this.getMessageBuilder();
        message.add(Segments.PID.random());
        message.add(Segments.PV1.random());
        return message;
    }
}

module.exports = ADTEngine;
