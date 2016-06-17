require('should');
var Segments = require('../../../lib/engines/segments/index');

describe('Segments', function () {
    it('should expose PID and PV1 with static methods "random"', function () {
        Segments.should.have.property('PID');
        Segments.should.have.property('PV1');
        Segments.PID.should.have.property('random');
        Segments.PV1.should.have.property('random');
    });
});
