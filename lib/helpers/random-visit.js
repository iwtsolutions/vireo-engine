'use strict';
var faker     = require('faker');
var random    = require('./random');
var locations = require('../enums/location');

var degreeTypes = [ 'MD', 'BA', 'BS', 'PN', 'CRN', 'CNS', 'DED', 'PHS', 'MT', 'PA', 'RPH', 'RMA' ];

exports.location = function () {
    let nurseUnits = Object.keys(locations);
    let nurseUnit = nurseUnits[random.getRandomInteger(0, nurseUnits.length - 1)];

    let rooms = Object.keys(locations[nurseUnit]);
    let room = rooms[random.getRandomInteger(0, rooms.length - 1)];

    let beds = Object.keys(locations[nurseUnit][room]);
    let bed = beds[random.getRandomInteger(0, beds.length - 1)];

    return {
        nurse: nurseUnit,
        room: room,
        bed: bed
    };
};

exports.class = function () {
    // http://hl7-definition.caristix.com:9010/Default.aspx?version=HL7+v2.5.1&table=0007
    const patientClass = 'EIOPRBCNU';
    return random.getRandomCharacters(1, patientClass);
};

exports.admitType = function () {
    // http://hl7-definition.caristix.com:9010/Default.aspx?version=HL7%20v2.5.1&table=0007
    const admitTypes = 'AELRNUC';
    return random.getRandomCharacters(1, admitTypes);
};

exports.doctor = function () {
    return {
        code: random.getRandomInteger(0, 8),
        family: faker.name.lastName(),
        given: faker.name.firstName(),
        middle: random.selectRandom('abcdefghijklmnopqrstuvwxyz'.split('')),
        degree: degreeTypes[random.getRandomInteger(0, degreeTypes.length - 1)]
    };
};

exports.hospitalService = function () {
    let hospitalServices = [ 'MED', 'SUR', 'URO', 'PUL', 'CAR' ];
    return hospitalServices[random.getRandomInteger(0, hospitalServices.length - 1)];
};

exports.admitSource = function () {
    let sources = [ 'Physician referral', 'Clinic referral', 'HMO referral', 'Transfer', 'ER' ];
    return sources[random.getRandomInteger(0, sources.length - 1)];
};
