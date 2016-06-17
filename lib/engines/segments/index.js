'use strict';
var pid = require('./pid');
var pv1 = require('./pv1');

class Segments {
    constructor(mappings) {
        this.pid = new pid(mappings.pid);
        this.pv1 = new pv1(mappings.pv1);
    }
}

Segments.PID = pid;
Segments.PV1 = pv1;

module.exports = Segments;
