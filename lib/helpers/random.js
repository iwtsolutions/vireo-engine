'use strict';
var crypto    = require('crypto');

exports.getRandomInteger = getRandomInteger;
exports.getRandomCharacters = getRandomCharacters;
exports.getRandomPatientIdentifier = function () {
    let identifierLength = getRandomInteger(5, 10);
    return getRandomCharacters(identifierLength, '0123456789');
};

function getRandomInteger(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function getRandomCharacters(count, chars) {
    if (!chars) {
        chars = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
    }
    var rnd = crypto.randomBytes(count);
    var value = new Array(count);
    var len = chars.length;

    for (var i = 0; i < count; i++) {
        value[i] = chars[rnd[i] % len];
    }

    return value.join('');
}
