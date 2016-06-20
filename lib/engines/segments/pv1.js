'use strict';
var Random  = require('../../helpers/random-visit');
var Builder = require('hl7-builder');
var date    = require('../../helpers/date');
var faker   = require('faker');

class PV1 {
    constructor() {
        // TODO: Use the parameter `mappings` to map specific fields to data from fakerjs
    }
    static random() {
        let segment = new Builder.Segment('PV1');

        segment.set(2, Random.class());
        segment.set(3, Random.location());
        segment.set(4, Random.admitType());
        segment.set(6, Random.location());
        segment.set(7, Random.doctor());
        segment.set(8, Random.doctor());
        segment.set(9, Random.consultingDoctors());
        segment.set(10, Random.hospitalService());
        segment.set(14, Random.admitSource());
        segment.set(17, Random.doctor());
        segment.set(44, date.toFullString(faker.date.recent()));

        return segment;
    }
}

module.exports = PV1;
