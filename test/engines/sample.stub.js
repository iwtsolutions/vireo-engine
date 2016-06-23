'use strict';
var models     = require('../../lib/models/index');
var BaseEngine = require('../../lib/engines/base-engine');

class SampleEngine extends BaseEngine {
    constructor(options, defaultMessageOptions) {
        super(options, defaultMessageOptions);
    }
    getRandom() {
        // Fake Implementation
    }
    getNextMessage(callback) {
        let message = this.getMessageBuilder({
            messageType: 'ADT',
            messageEvent: 'A01'
        });
        let visit = new models.visit();
        message.add(new models.patient(visit.account).toSegment());
        message.add(visit.toSegment());
        callback(null, message.toString());
    }
}

module.exports = SampleEngine;
