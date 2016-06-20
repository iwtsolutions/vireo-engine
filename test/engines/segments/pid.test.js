require('should');
var pid = require('../../../lib/engines/segments/pid');

describe('Segments/PID', function () {
    it('should generate random segments from PID.random', function () {
        pid.random().should.not.equal(pid.random());
    });

    it('should generate random accounts and mrns', function () {
        var r1 = pid.random();
        var r2 = pid.random();

        r1.get(3).should.not.equal(r2.get(3));
        r1.get(18).should.not.equal(r2.get(18));
    });
});
