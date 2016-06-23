'use strict';
var crypto      = require('crypto');
var randomVisit = require('./random-visit');
var randomEvent = require('./random-event');

exports.visit = randomVisit;
exports.event = randomEvent;
exports.getRandomInteger = getRandomInteger;
exports.getRandomCharacters = getRandomCharacters;
exports.getRandomPatientIdentifier = function () {
    let identifierLength = getRandomInteger(5, 10);
    return getRandomCharacters(identifierLength, '0123456789');
};
exports.selectRandom = function (obj) {
    if (obj.constructor === Array) {
        return obj[getRandomInteger(0, obj.length)];
    }

    let keys = Object.keys(obj);
    return obj[keys[getRandomInteger(0, keys.length)]];
};

function getRandomInteger(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function getRandomCharacters(count, chars) {
    if (!chars) {
        chars = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
    }
    let rnd = crypto.randomBytes(count);
    let value = new Array(count);
    let len = chars.length;

    for (let i = 0; i < count; i++) {
        value[i] = chars[rnd[i] % len];
    }

    return value.join('');
}
