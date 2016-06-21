'use strict';
var faker     = require('faker');
var date      = require('../helpers/date');
var random    = require('../helpers/random');
var Builder   = require('hl7-builder');
var BaseModel = require('./base-model');

class Patient extends BaseModel {
    constructor(patient = {}) {
        super(patient);
        this.mrn = patient.mrn || random.getRandomPatientIdentifier();
        this.name = patient.name || {
            family: faker.name.lastName(),
            given: faker.name.firstName(),
            middle: random.selectRandom('abcdefghijklmnopqrstuvwxyz'.split(''))
        };
        this.mothersMaidenName = patient.mothersMaidenName || faker.name.lastName();
        this.dob = patient.dob || faker.date.between('01/01/1920', '01/01/2010');
        this.sex = patient.sex || random.selectRandom([ 'm', 'f', 'u' ]);
        this.address = patient.address || {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.stateAbbr(),
            zip: faker.address.zipCode()
        };
        this.phone = patient.phone || faker.phone.phoneNumberFormat(1);
        this.ssn = '000000000';
    }
    toSegment(account) {
        // TODO: Use the parameter `mappings` to map specific fields to data from fakerjs
        let segment = new Builder.Segment('PID');
        segment.set(3, this.mrn);

        if (account) {
            segment.set(18, account || '');
        }

        let name = new Builder.Field();
        name.set(0, this.name.family);
        name.set(1, this.name.given);
        name.set(2, this.name.middle);
        segment.set(5, name);
        segment.set(6, this.mothersMaidenName);

        segment.set(7, date.toDateString(this.dob));

        // Name is completely random, so it may not match the sex.
        segment.set(8, this.sex);

        let address = new Builder.Field();
        address.set(0, this.address.street);
        address.set(2, this.address.city);
        address.set(3, this.address.state);
        address.set(4, this.address.zip);

        segment.set(11, address);
        segment.set(13, this.phone);
        segment.set(19, this.ssn);

        return segment;
    }
}

Patient.schema = {
    mrn: { type: 'string', required: true, unique: true },
    name: {
        family: 'string',
        given: 'string',
        middle: 'string'
    },
    mothersMaidenName: 'string',
    dob: 'string',
    sex: 'string',
    address: {
        street: 'string',
        city: 'string',
        state: 'string',
        zip: 'string'
    },
    phone: 'strin',
    ssn: 'string'
};

module.exports = Patient;
