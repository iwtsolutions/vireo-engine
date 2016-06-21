'use strict';
require('should');
var random = require('../../lib/helpers/random-event');

describe('Random Event', function () {
    describe('ADT', function () {
        it('should return an admission like event with no previous event', function () {
            let admissionEvents = [ 'A01', 'A04', 'A05', 'A14' ];

            admissionEvents.should.containEql(random.adt());
        });
    });
});
