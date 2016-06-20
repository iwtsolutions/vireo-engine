'use strict';
var faker     = require('faker');
var Random    = require('./random');
var Builder   = require('hl7-builder');
var locations = require('../enums/location');

var degreeTypes = [ 'MD', 'BA', 'BS', 'PN', 'CRN', 'CNS', 'DED', 'PHS', 'MT', 'PA', 'RPH', 'RMA' ];

exports.location = function () {
    let nurseUnits = Object.keys(locations);
    let nurseUnit = nurseUnits[Random.getRandomInteger(0, nurseUnits.length - 1)];

    let rooms = Object.keys(locations[nurseUnit]);
    let room = rooms[Random.getRandomInteger(0, rooms.length - 1)];

    let beds = Object.keys(locations[nurseUnit][room]);
    let bed = beds[Random.getRandomInteger(0, beds.length - 1)];

    var loc = new Builder.Field(3);
    loc.set(0, nurseUnit);
    loc.set(1, room);
    loc.set(2, bed);
    return loc;
};

exports.class = function () {
    // http://hl7-definition.caristix.com:9010/Default.aspx?version=HL7+v2.5.1&table=0007
    const patientClass = 'EIOPRBCNU';
    return Random.getRandomCharacters(1, patientClass);
};

exports.admitType = function () {
    // http://hl7-definition.caristix.com:9010/Default.aspx?version=HL7%20v2.5.1&table=0007
    const admitTypes = 'AELRNUC';
    return Random.getRandomCharacters(1, admitTypes);
};

exports.doctor = function () {
    let name = new Builder.Field();
    name.set(0, Random.getRandomInteger(0, 8));
    name.set(1, faker.name.lastName());
    name.set(2, faker.name.firstName());
    name.set(5, degreeTypes[Random.getRandomInteger(0, degreeTypes.length - 1)]);

    return name;
};

exports.consultingDoctors = function () {
    let docs = new Builder.Field();
    var doctorCount = Random.getRandomInteger(0, 10);

    for (var i = 0; i < doctorCount; i++) {
        docs.set(0, Random.getRandomInteger(0, 8));
        docs.set(1, faker.name.lastName());
        docs.set(2, faker.name.firstName());
        docs.set(5, degreeTypes[Random.getRandomInteger(0, degreeTypes.length - 1)]);

        if (i + 1 < doctorCount) {
            docs.repeat();
        }
    }

    return docs;
};

exports.hospitalService = function () {
    var hospitalServices = [ 'MED', 'SUR', 'URO', 'PUL', 'CAR' ];
    return hospitalServices[Random.getRandomInteger(0, hospitalServices.length - 1)];
};

exports.admitSource = function () {
    var sources = [ 'Physician referral', 'Clinic referral', 'HMO referral', 'Transfer', 'ER' ];
    return sources[Random.getRandomInteger(0, sources.length - 1)];
};
