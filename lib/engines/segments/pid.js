'use strict';
var faker   = require('faker');
var Builder = require('hl7-builder');
var date    = require('../../helpers/date');
var Random  = require('../../helpers/random');

class PID {
    constructor() {
        // TODO: Use the parameter `mappings` to map specific fields to data from fakerjs
    }
    static random() {
        let segment = new Builder.Segment('PID');
        segment.set(3, Random.getRandomPatientIdentifier());
        segment.set(18, Random.getRandomPatientIdentifier());

        let name = new Builder.Field();
        name.set(0, faker.name.lastName());
        name.set(1, faker.name.firstName());
        segment.set(5, name);
        segment.set(5, faker.name.lastName());

        let dob = faker.date.between('01/01/1920', '01/01/1990');
        segment.set(7, date.toDateString(dob));

        // Name is completely random, so it may not match the sex.
        segment.set(8, faker.random.number({ max: 1 }) === 1 ? 'M' : 'F');

        let address = new Builder.Field();
        address.set(0, faker.address.streetAddress());
        address.set(2, faker.address.city());
        address.set(3, faker.address.stateAbbr());
        address.set(4, faker.address.zipCode());

        segment.set(11, address);
        segment.set(13, faker.phone.phoneNumberFormat(1));
        segment.set(19, '000000000');

        return segment;
    }
}

module.exports = PID;
