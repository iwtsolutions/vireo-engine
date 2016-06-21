'use strict';
var BaseEngine = require('../../lib/engines/base-engine');

class SampleEngine extends BaseEngine {
    constructor(options, defaultMessageOptions) {
        super(options, defaultMessageOptions);
    }
    consume() {
        // Fake Implementation
    }
    getRandom() {
        // Fake Implementation
    }
}

module.exports = SampleEngine;
