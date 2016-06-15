require('should');
var Random = require('../../lib/helpers/random');

describe('Random', function () {
    it('should generate a random integers', function () {
        var num1 = Random.getRandomInteger(1, 10000);
        var num2 = Random.getRandomInteger(1, 10000);
        num1.should.not.equal(num2);
    });

    it('should generate an integer between 5 and 10', function () {
        for (var i = 0; i < 10; i++) {
            let num = Random.getRandomInteger(5, 10);
            num.should.be.above(4);
            num.should.be.below(11);
        }
    });

    it('should generate random patient identifiers', function () {
        var pid1 = Random.getRandomPatientIdentifier();
        var pid2 = Random.getRandomPatientIdentifier();
        pid1.should.not.equal(pid2);
    });

    it('should generate random characters with a count of 5', function () {
        var chars1 = Random.getRandomCharacters(5);
        var chars2 = Random.getRandomCharacters(5);
        chars1.should.not.equal(chars2);
        chars1.length.should.equal(5);
        chars2.length.should.equal(5);
    });

    it('should generate random characters with characters a, b, and c', function () {
        var chars1 = Random.getRandomCharacters(5, 'abc');
        var chars2 = Random.getRandomCharacters(5, 'abc');
        for (let i = 0; i < chars1.length; i++) {
            'abc'.should.containEql(chars1[i]);
        }
        for (let i = 0; i < chars2.length; i++) {
            'abc'.should.containEql(chars2[i]);
        }
    });
});
