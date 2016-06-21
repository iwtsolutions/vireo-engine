'use strict';
var should = require('should');
var date   = require('../../lib/helpers/date');
var visit  = require('../../lib/models/visit');

describe('visit', function () {
    let sample = new visit({
        class: 'F',
        location: {
            nurse: 'NUR',
            room: '111',
            bed: 'a'
        },
        previousLocation: {
            nurse: 'NUR2',
            room: '222',
            bed: 'b'
        },
        admitType: 'L',
        admittingDoctor: {
            code: '2123',
            family: 'wang',
            given: 'chan',
            middle: 'a',
            degree: 'MD'
        },
        referringDoctor: {
            code: '532',
            family: 'Peppermint',
            given: 'Red',
            middle: 'y',
            degree: 'BA'
        },
        consultingDoctors: {
            '66768': {
                code: '66768',
                family: 'Rogen',
                given: 'Billy',
                middle: 'g',
                degree: 'BS'
            },
            '66769': {
                code: '66769',
                family: 'Rogen',
                given: 'Johnny',
                middle: 'j',
                degree: 'BSA'
            }
        },
        attendingDoctor: {
            code: '9911',
            family: 'McGill',
            given: 'Sarah',
            middle: 'c',
            degree: 'RA'
        },
        admitSource: 'car',
        hospitalService: 'heliflopter',
        admitDate: new Date('01/01/2015'),
        dischargeDate: new Date('02/01/2015')
    });

    it('should generate random visit properties', function () {
        let v1 = new visit();
        'EIOPRBCNU'.should.containEql(v1.class);
        v1.location.nurse.length.should.be.above(0);
        v1.location.room.length.should.be.above(0);
        v1.location.bed.length.should.be.above(0);
        'AELRNUC'.should.containEql(v1.admitType);
        v1.previousLocation.should.have.property('nurse', '');
        v1.previousLocation.should.have.property('room', '');
        v1.previousLocation.should.have.property('bed', '');

        v1.admittingDoctor.family.length.should.be.above(0);
        v1.admittingDoctor.given.length.should.be.above(0);
        v1.admittingDoctor.middle.length.should.be.above(0);
        v1.admittingDoctor.degree.length.should.be.above(0);

        v1.referringDoctor.family.length.should.be.above(0);
        v1.referringDoctor.given.length.should.be.above(0);
        v1.referringDoctor.middle.length.should.be.above(0);
        v1.referringDoctor.degree.length.should.be.above(0);

        v1.attendingDoctor.family.length.should.be.above(0);
        v1.attendingDoctor.given.length.should.be.above(0);
        v1.attendingDoctor.middle.length.should.be.above(0);
        v1.attendingDoctor.degree.length.should.be.above(0);

        v1.consultingDoctors.should.be.instanceof(Object);
        Object.keys(v1.consultingDoctors).length.should.be.above(0);
        [ 'Physician referral', 'Clinic referral', 'HMO referral', 'Transfer', 'ER' ].should.containEql(v1.admitSource);

        [ 'MED', 'SUR', 'URO', 'PUL', 'CAR' ].should.containEql(v1.hospitalService);
    });

    it('should set visit properties to passed in object', function () {
        sample.class.should.equal('F');
        sample.location.nurse.should.equal('NUR');
        sample.location.room.should.equal('111');
        sample.location.bed.should.equal('a');
        sample.admitType.should.equal('L');
        sample.previousLocation.nurse.should.equal('NUR2');
        sample.previousLocation.room.should.equal('222');
        sample.previousLocation.bed.should.equal('b');

        sample.admittingDoctor.code.should.equal('2123');
        sample.admittingDoctor.family.should.equal('wang');
        sample.admittingDoctor.given.should.equal('chan');
        sample.admittingDoctor.middle.should.equal('a');
        sample.admittingDoctor.degree.should.equal('MD');

        sample.referringDoctor.code.should.equal('532');
        sample.referringDoctor.family.should.equal('Peppermint');
        sample.referringDoctor.given.should.equal('Red');
        sample.referringDoctor.middle.should.equal('y');
        sample.referringDoctor.degree.should.equal('BA');

        sample.attendingDoctor.code.should.equal('9911');
        sample.attendingDoctor.family.should.equal('McGill');
        sample.attendingDoctor.given.should.equal('Sarah');
        sample.attendingDoctor.middle.should.equal('c');
        sample.attendingDoctor.degree.should.equal('RA');

        Object.keys(sample.consultingDoctors).length.should.equal(2);
        sample.consultingDoctors['66768'].code.should.equal('66768');
        sample.consultingDoctors['66768'].family.should.equal('Rogen');
        sample.consultingDoctors['66768'].given.should.equal('Billy');
        sample.consultingDoctors['66768'].middle.should.equal('g');
        sample.consultingDoctors['66768'].degree.should.equal('BS');
        sample.consultingDoctors['66769'].code.should.equal('66769');
        sample.consultingDoctors['66769'].family.should.equal('Rogen');
        sample.consultingDoctors['66769'].given.should.equal('Johnny');
        sample.consultingDoctors['66769'].middle.should.equal('j');
        sample.consultingDoctors['66769'].degree.should.equal('BSA');

        sample.admitSource.should.equal('car');
        sample.hospitalService.should.equal('heliflopter');

        sample.admitDate.should.equal(date.toFullString(new Date('01/01/2015')));
        sample.dischargeDate.should.equal(date.toFullString(new Date('02/01/2015')));
    });

    it('should set admitDate', function () {
        let v = new visit();
        should.not.exist(v.admitDate);
        v.setAdmitDate(new Date('02/02/2016'));
        v.admitDate.should.equal(date.toFullString(new Date('02/02/2016')));
    });

    it('should default dischargeDate to now', function () {
        let v = new visit();
        should.not.exist(v.admitDate);
        v.setAdmitDate();
        let now = date.toFullString(new Date()).substring(0, 8);
        v.admitDate.should.containEql(now);
    });

    it('should set dischargeDate', function () {
        let v = new visit();
        should.not.exist(v.dischargeDate);
        v.setDischargeDate(new Date('03/03/2016'));
        v.dischargeDate.should.equal(date.toFullString(new Date('03/03/2016')));
    });

    it('should default dischargeDate to now', function () {
        let v = new visit();
        should.not.exist(v.dischargeDate);
        v.setDischargeDate();
        let now = date.toFullString(new Date()).substring(0, 8);
        v.dischargeDate.should.containEql(now);
    });

    it('should pv1 to a hl7 segment', function () {
        let result = sample.toSegment().toString();
        let segment = 'PV1||F|NUR^111^a|L||NUR2^222^b|9911^McGill^Sarah^c^^^RA|532^Peppermint^Red^y^^^BA|' +
            '66768^Rogen^Billy^g^^^BS~66769^Rogen^Johnny^j^^^BSA|heliflopter||||car|||2123^wang^chan^a^^^MD' +
            '|||||||||||||||||||||||||||20150101000000|20150201000000';
        result.should.containEql(segment);
    });

    it('should update previous location when updating location', function () {
        let v = new visit();
        let oldLocation = v.location;

        v.setLocation('NUR22');
        v.location.nurse.should.equal('NUR22');
        v.location.room.should.equal('');
        v.location.bed.should.equal('');

        v.previousLocation.nurse.should.equal(oldLocation.nurse);
        v.previousLocation.room.should.equal(oldLocation.room);
        v.previousLocation.bed.should.equal(oldLocation.bed);
    });
});
