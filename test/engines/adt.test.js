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
        let messageFind = null;

        before(function (done) {
            engine = new ADT();
            engine.once('ready', function () {
                messageFind = engine.driver.models.message.find;
                engine.getAvailablePatient(function (error, availablePatient, availableVisit) {
                    should.not.exist(error);
                    patient = availablePatient;
                    visit = availableVisit;

                    done();
                });
            });
        });
        afterEach(function () {
            engine.driver.models.message.find = messageFind;
        });

        it('should get an emit event with no previous messages', function (done) {
            let events = [ 'A01', 'A04', 'A05', 'A14' ];
            engine.driver.models.message.find = sinon.spy(function (query, callback) {
                callback(null, []);
            });
            engine.getNextEvent(patient, visit, function (error, event) {
                should.not.exist(error);
                engine.driver.models.message.find.calledOnce.should.be.true();
                events.should.containEql(event);
                done();
            });
        });

        it('should get a "regular" event with a previous A01', function (done) {
            let events = [ 'A02', 'A03', 'A07', 'A08', 'A12', 'A15', 'A16', 'A15', 'A20', 'A21', 'A28', 'A31' ];
            engine.driver.models.message.find = sinon.spy(function (query, callback) {
                callback(null, [ {
                    event: 'A01'
                } ]);
            });
            engine.getNextEvent(patient, visit, function (error, event) {
                should.not.exist(error);
                engine.driver.models.message.find.calledOnce.should.be.true();
                events.should.containEql(event);
                done();
            });
        });

        it('should get an emit event with only previous "update" events', function (done) {
            let events = [ 'A01', 'A04', 'A05', 'A14' ];
            engine.driver.models.message.find = sinon.spy(function (query, callback) {
                callback(null, [ { event: 'A08' }, { event: 'A31' } ]);
            });
            engine.getNextEvent(patient, visit, function (error, event) {
                should.not.exist(error);
                engine.driver.models.message.find.calledOnce.should.be.true();
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
});
