'use strict';
var Builder = require('hl7-builder');

class PV1 {
    constructor() {
        // TODO: Use the parameter `mappings` to map specific fields to data from fakerjs
    }
    static random() {
        let segment = new Builder.Segment('PV1');

        // TODO: Generate random PV1 values
        return segment;
    }
}

module.exports = PV1;
