require('should');
var ADT = require('../../lib/engines/adt');

describe('ADT', function () {
    describe('random', function () {
        it('should generate random adt messages', function () {
            var adt = new ADT();
            adt.getRandom().should.not.equal(adt.getRandom());
        });
    });
});
