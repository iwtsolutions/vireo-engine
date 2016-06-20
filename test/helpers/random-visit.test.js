'use strict';
var should = require('should');
var rnd    = require('../../lib/helpers/random-visit');

describe('RandomVisit', function () {
    it('should get a random location', function () {
        var l1 = rnd.location();
        var l2 = rnd.location();

        l1.toString().should.not.equal(l2.toString());
    });

    it('should get a random patient class', function () {
        // multi comparisons as class only has a few values.
        for (var i = 0; i < 5; i++) {
            var c1 = rnd.class();
            var c2 = rnd.class();
            if (c1.toString() !== c2.toString()) {
                return;
            }
        }
        should.fail();
    });

    it('should get a random admit type', function () {
        // multi comparisons as type only has a few values.
        for (var i = 0; i < 5; i++) {
            var a1 = rnd.admitType();
            var a2 = rnd.admitType();
            if (a1.toString() !== a2.toString()) {
                return;
            }
        }
        should.fail();
    });

    it('should get a random doctor', function () {
        var d1 = rnd.doctor();
        var d2 = rnd.doctor();
        d1.toString().should.not.equal(d2.toString());
    });

    it('should get random consulting doctors', function () {
        var d1 = rnd.consultingDoctors();
        var d2 = rnd.consultingDoctors();
        d1.toString().should.not.equal(d2.toString());
    });

    it('should get a random hospital service', function () {
        // multi comparisons as hosp svc only has a few values.
        for (var i = 0; i < 5; i++) {
            var h1 = rnd.hospitalService();
            var h2 = rnd.hospitalService();
            if (h1.toString() !== h2.toString()) {
                return;
            }
        }
        should.fail();
    });

    it('should get a random admit source', function () {
        // multi comparisons as source only has a few values.
        for (var i = 0; i < 5; i++) {
            var a1 = rnd.admitSource();
            var a2 = rnd.admitSource();
            if (a1.toString() !== a2.toString()) {
                return;
            }
        }
        should.fail();
    });
});
