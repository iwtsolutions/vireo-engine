'use strict';
var Engine  = require('./engine');
// var Random  = require('../helpers/random');
var Drivers = require('../drivers/index');

var defaultOptions = {
    application: 'Vireo',
    facility: 'IWT Health',
    storageDriver: Drivers.Memory
};

class OrderEngine extends Engine {
    constructor(options=defaultOptions) {
        super(options);
    }
}

module.exports = OrderEngine;
