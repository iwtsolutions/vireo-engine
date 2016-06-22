'use strict';
var should = require('should');
var _      = require('underscore');
var random = require('../../lib/helpers/random');

describe('Random', function () {
    it('should expose random-visit and random-event', function () {
        random.should.have.property('visit');
        random.should.have.property('event');
    });
    it('should generate a random integers', function () {
        let num1 = random.getRandomInteger(1, 10000);
        let num2 = random.getRandomInteger(1, 10000);
        num1.should.not.equal(num2);
    });

    it('should generate an integer between 5 and 10', function () {
        for (let i = 0; i < 10; i++) {
            let num = random.getRandomInteger(5, 10);
            num.should.be.above(4);
            num.should.be.below(11);
        }
    });

    it('should generate random patient identifiers', function () {
        let pid1 = random.getRandomPatientIdentifier();
        let pid2 = random.getRandomPatientIdentifier();
        pid1.should.not.equal(pid2);
    });

    it('should generate random characters with a count of 5', function () {
        let chars1 = random.getRandomCharacters(5);
        let chars2 = random.getRandomCharacters(5);
        chars1.should.not.equal(chars2);
        chars1.length.should.equal(5);
        chars2.length.should.equal(5);
    });

    it('should generate random characters with characters a, b, and c', function () {
        let chars1 = random.getRandomCharacters(5, 'abc');
        let chars2 = random.getRandomCharacters(5, 'abc');
        for (let i = 0; i < chars1.length; i++) {
            'abc'.should.containEql(chars1[i]);
        }
        for (let i = 0; i < chars2.length; i++) {
            'abc'.should.containEql(chars2[i]);
        }
    });

    it('should get a random value from an large array', function () {
        let arr = 'abcdefghijklmnopqrstuvwxyz123456789'.split('');
        for (let i = 0; i < 3; i++) {
            if (random.selectRandom(arr) !== random.selectRandom(arr)) {
                return;
            }
        }
        should.fail('No unique combinations were found');
    });

    it('should get a random value from a small array', function () {
        let arr = [ 'a', 'b' ];
        for (let i = 0; i < 10; i++) {
            if (random.selectRandom(arr) !== random.selectRandom(arr)) {
                return;
            }
        }
        should.fail('No unique combinations were found');
    });

    it('should get a random value from an object', function () {
        let arr = 'abcdefghijklmnopqrstuvwxyz123456789'.split('');
        let obj = _.extend({}, arr);
        random.selectRandom(obj).should.not.equal(random.selectRandom(obj));
    });
});
