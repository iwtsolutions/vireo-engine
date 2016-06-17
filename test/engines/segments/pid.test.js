require('should');
var l7 = require('L7');
var pid = require('../../../lib/engines/segments/pid');

describe('Segments/PID', function () {
    it('should generate random segments from PID.random', function () {
        pid.random().should.not.equal(pid.random());
    });

    // TODO: Pull hl7-builder changes
    //it('should generate random accounts and mrns', function () {
        //var r1 = pid.random();
        //var r2 = pid.random();

        //var p1 = l7.parse(r1);
        //var p2 = l7.parse(r2);

        //p1.query('PID|3').should.not.equal(p2.query('PID|3'));
        //p1.query('PID|18').should.not.equal(p2.query('PID|18'));
    //});
});
