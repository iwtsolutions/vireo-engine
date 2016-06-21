'use strict';
require('should');
var patient = require('../../lib/models/patient');

describe('patient', function () {
    it('should generate random patient properties', function () {
        let p1 = new patient();
        let p2 = new patient();

        p1.mrn.should.not.equal(p2.mrn);
        p1.name.family.should.not.equal(p2.name.family);
        p1.name.given.should.not.equal(p2.name.given);
        p1.name.middle.should.not.equal(p2.name.middle);
        p1.mothersMaidenName.should.not.equal(p2.mothersMaidenName);
        p1.dob.should.not.equal(p2.dob);
        p1.address.street.should.not.equal(p2.address.street);
        p1.address.city.should.not.equal(p2.address.city);
        p1.address.state.should.not.equal(p2.address.state);
        p1.address.zip.should.not.equal(p2.address.zip);
        p1.phone.should.not.equal(p2.phone);
    });

    it('should set properties passed in', function () {
        let pt = new patient({
            mrn: '11111',
            name: {
                family: 'ross',
                given: 'bob',
                middle: 'n'
            },
            mothersMaidenName: 'rossy',
            dob: '01/05/1950',
            address: {
                street: '1234 apple road',
                city: 'Chicago',
                state: 'IL',
                zip: '55541'
            },
            phone: '810-811-8098'
        });

        pt.mrn.should.equal('11111');
        pt.name.family.should.equal('ross');
        pt.name.given.should.equal('bob');
        pt.name.middle.should.equal('n');
        pt.mothersMaidenName.should.equal('rossy');
        pt.dob.should.equal('01/05/1950');
        pt.address.street.should.equal('1234 apple road');
        pt.address.city.should.equal('Chicago');
        pt.address.state.should.equal('IL');
        pt.address.zip.should.equal('55541');
        pt.phone.should.equal('810-811-8098');
    });

    it('should convert a patient to a PID segment', function () {
        let pt = new patient({
            mrn: '11111',
            name: {
                family: 'ross',
                given: 'bob',
                middle: 'n'
            },
            mothersMaidenName: 'rossy',
            dob: new Date('01/05/1950'),
            address: {
                street: '1234 apple road',
                city: 'Chicago',
                state: 'IL',
                zip: '55541'
            },
            sex: 'm',
            phone: '810-811-8098'
        });

        let pid = pt.toSegment().toString();

        let contains = 'PID|||11111||ross^bob^n|rossy|19500105|m|||1234 apple road^^Chicago^IL^55541||810-811-8098';
        pid.should.containEql(contains);
    });

    it('should convert a patient to a PID segment with an account', function () {
        let pt = new patient({
            mrn: '22222',
            name: {
                family: 'ross',
                given: 'dave',
                middle: 'n'
            },
            mothersMaidenName: 'rr',
            dob: new Date('01/06/1950'),
            address: {
                street: '1234',
                city: 'Chicago',
                state: 'IL',
                zip: '55541'
            },
            sex: 'm',
            phone: '8'
        });

        let pid = pt.toSegment('7777').toString();

        let contains = 'PID|||22222||ross^dave^n|rr|19500106|m|||1234^^Chicago^IL^55541||8|||||7777';
        pid.should.containEql(contains);
    });
});
