require('should');
var pv1 = require('../../../lib/engines/segments/pv1');

describe('Segments/PV1', function () {
    it('should generate random segments from PV1.random', function () {
        pv1.random().should.not.equal(pv1.random());
    });
});
