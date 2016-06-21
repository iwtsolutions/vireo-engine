'use strict';
var should = require('should');
var random = require('../../lib/helpers/random-visit');

describe('RandomVisit', function () {
    it('should get a random location', function () {
        let l1 = random.location();
        let l2 = random.location();

        let nrb1 = l1.nurse + l1.room + l1.bed;
        let nrb2 = l2.nurse + l2.room + l2.bed;
        nrb1.toString().should.not.equal(nrb2.toString());
    });

    it('should get a random patient class', function () {
        // multi comparisons as class only has a few values.
        for (let i = 0; i < 5; i++) {
            let c1 = random.class();
            let c2 = random.class();
            if (c1.toString() !== c2.toString()) {
                return;
            }
        }
        should.fail();
    });

    it('should get a random admit type', function () {
        // multi comparisons as type only has a few values.
        for (let i = 0; i < 5; i++) {
            let a1 = random.admitType();
            let a2 = random.admitType();
            if (a1.toString() !== a2.toString()) {
                return;
            }
        }
        should.fail();
    });

    it('should get a random doctor', function () {
        let d1 = random.doctor();
        let d2 = random.doctor();
        d1.code.toString().should.not.equal(d2.code.toString());
    });

    it('should get a random hospital service', function () {
        // multi comparisons as hosp svc only has a few values.
        for (let i = 0; i < 5; i++) {
            let h1 = random.hospitalService();
            let h2 = random.hospitalService();
            if (h1.toString() !== h2.toString()) {
                return;
            }
        }
        should.fail();
    });

    it('should get a random admit source', function () {
        // multi comparisons as source only has a few values.
        for (let i = 0; i < 5; i++) {
            let a1 = random.admitSource();
            let a2 = random.admitSource();
            if (a1.toString() !== a2.toString()) {
                return;
            }
        }
        should.fail();
    });
});
