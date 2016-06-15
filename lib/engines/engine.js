'use strict';
var Enums        = require('../enums/index');
var EventEmitter = require('events').EventEmitter;

var defaultOptions = {
    speed: Enums.Speed.Slow,
    mode: Enums.Mode.Random
};

class Engine extends EventEmitter {
    constructor(options=defaultOptions) {
        super();
        this.options = options;
    }
}

module.exports = Engine;
