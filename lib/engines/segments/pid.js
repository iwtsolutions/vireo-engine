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
        segment.update(3, Random.getRandomPatientIdentifier());
        segment.update(18, Random.getRandomPatientIdentifier());

        let name = new Builder.Field();
        name.update(0, faker.name.lastName());
        name.update(1, faker.name.firstName());
        segment.update(5, name);

        let dob = faker.date.between('01/01/1920', '01/01/1990');
        segment.update(7, date.toDateString(dob));

        // Name is completely random, so it may not match the sex.
        segment.update(8, faker.random.number({ max: 1 }) === 1 ? 'M' : 'F');

        let address = new Builder.Field();
        address.update(0, faker.address.streetAddress());
        address.update(2, faker.address.city());
        address.update(3, faker.address.stateAbbr());
        address.update(4, faker.address.zipCode());

        segment.update(11, address);
        segment.update(13, faker.phone.phoneNumberFormat(1));
        segment.update(19, '000000000');

        return segment;
    }
}

module.exports = PID;
