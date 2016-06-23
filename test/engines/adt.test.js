'use strict';
var should = require('should');
var sinon  = require('sinon');
var ADT    = require('../../lib/engines/adt');

describe('ADT', function () {
    describe('random', function () {
        it('should generate random adt messages', function () {
            let adt = new ADT();
            adt.getRandom().should.not.equal(adt.getRandom());
        });
    });

    describe('getNextEvent', function () {
        let patient = null;
        let visit = null;
        let engine = null;
        let messageFindOne = null;

        before(function (done) {
            engine = new ADT();
            engine.once('ready', function () {
                messageFindOne = engine.driver.models.message.findOne;
                engine.getAvailablePatient(function (error, availablePatient, availableVisit) {
                    should.not.exist(error);
                    patient = availablePatient;
                    visit = availableVisit;

                    done();
                });
            });
        });
        afterEach(function () {
            engine.driver.models.message.findOne = messageFindOne;
        });

        it('should get an emit event with no previous messages', function (done) {
            let events = [ 'A01', 'A04', 'A05', 'A14' ];
            engine.driver.models.message.findOne = sinon.spy(function (query, callback) {
                callback();
            });
            engine.getNextEvent(patient, visit, function (error, event) {
                should.not.exist(error);
                engine.driver.models.message.findOne.calledOnce.should.be.true();
                events.should.containEql(event);
                done();
            });
        });

        it('should get a "regular" event with a previous A01', function (done) {
            let events = [ 'A02', 'A03', 'A07', 'A08', 'A12', 'A15', 'A16', 'A15', 'A20', 'A21', 'A28', 'A31' ];
            engine.driver.models.message.findOne = sinon.spy(function (query, callback) {
                callback(null, {
                    event: 'A01'
                });
            });
            engine.getNextEvent(patient, visit, function (error, event) {
                should.not.exist(error);
                engine.driver.models.message.findOne.calledOnce.should.be.true();
                events.should.containEql(event);
                done();
            });
        });
    });

    describe('getNextMessage', function () {
        let engine = null;
        before(function (done) {
            engine = new ADT({ mode: 'Simulated' });
            engine.once('ready', function () {
                done();
            });
        });

        it('should callback a message and save to message model', function (done) {
            let patient = new engine.driver.models.patient();
            let visit = new engine.driver.models.visit();

            engine.getAvailablePatient = sinon.spy(function (existing, callback) {
                callback(null, patient, visit);
            });

            engine.getNextMessage(function (error, message) {
                should.not.exist(error);
                message.should.containEql('MSH|^~\\&|');
                engine.driver.models.message.find({ mrn: patient.mrn, account: visit.account },
                    function (findError, messages) {
                        should.not.exist(findError);
                        messages.length.should.equal(1);
                        messages[0].should.have.property('hl7', message);
                        messages[0].should.have.property('type', 'ADT');

                        done();
                    }
                );
            });
        });
    });

    describe('newPatientProbability', function () {
        it('should throw if newPatientProbability is not between 1 and 100', function () {
            (() => new ADT({ newPatientProbability: 101 })).should.throw();
            (() => new ADT({ newPatientProbability: 'test' })).should.throw();
        });

        it('should return new patients every time with 100% new patient probability', function (done) {
            let engine = new ADT({ mode: 'Simulated', speed: { max: 1 }, newPatientProbability: 100 });
            engine.once('ready', function () {
                let patient = new engine.driver.models.patient();
                let visit = new engine.driver.models.visit();

                engine.getAvailablePatient = sinon.spy(function (existing, callback) {
                    callback(null, patient, visit);
                });

                let count = 0;
                engine.on('message', function () {
                    count++;
                    if (count === 10) {
                        engine.stop();
                        engine.getAvailablePatient.callCount.should.equal(10);
                        engine.getAvailablePatient.calledWith(false).should.be.true();
                        engine.getAvailablePatient.calledWith(true).should.be.false();
                        return done();
                    }
                });
                engine.consume();
            });
        });

        it('should return existing patients (almost) every time with 1% new patient probability', function (done) {
            let engine = new ADT({ mode: 'Simulated', speed: { min: 0, max: 1 }, newPatientProbability: 1 });
            engine.once('ready', function () {
                let patient = new engine.driver.models.patient();
                let visit = new engine.driver.models.visit();

                let newPatientCount = 0;
                engine.getAvailablePatient = sinon.spy(function (existing, callback) {
                    if (existing === false) {
                        newPatientCount++;
                    }
                    callback(null, patient, visit);
                });

                let count = 0;
                engine.on('message', function () {
                    count++;
                    if (count === 20) {
                        engine.stop();
                        engine.getAvailablePatient.callCount.should.equal(20);
                        newPatientCount.should.be.below(2); // should be called once, if that

                        engine.getAvailablePatient.calledWith(true).should.be.true();
                        return done();
                    }
                });
                engine.consume();
            });
        });
    });
});
