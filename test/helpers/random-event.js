'use strict';
require('should');
var random = require('../../lib/helpers/random-event');

describe('Random Event', function () {
    describe('ADT', function () {
        it('should return an admission like event with no previous event', function () {
            let events = [ 'A01', 'A04', 'A05', 'A14' ];
            events.should.containEql(random.adt());
        });

        it('should return a "normal" event wiith a previous A01', function () {
            let events = [ 'A02', 'A03', 'A07', 'A08', 'A12', 'A15', 'A16', 'A15', 'A20', 'A21', 'A28', 'A31' ];
            events.should.containEql(random.adt('A01'));
        });
    });
});
