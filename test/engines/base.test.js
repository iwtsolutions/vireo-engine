'use strict';
var should       = require('should');
var Builder      = require('hl7-builder');
var SampleEngine = require('./sample.stub');

describe('BaseEngine', function () {
    it('should provide default options', function () {
        let engine = new SampleEngine();
        engine.options.should.have.property('speed', 'Slow');
        engine.options.should.have.property('mode', 'Random');

        engine.defaultMessageOptions.should.have.property('application', 'Vireo');
        engine.defaultMessageOptions.should.have.property('facility', 'IWT Health');
        engine.defaultMessageOptions.should.have.property('messageType', 'ADT');
        engine.defaultMessageOptions.should.have.property('version', '2.3');
        engine.defaultMessageOptions.should.have.property('receivingApplication', 'Application X');
        engine.defaultMessageOptions.should.have.property('receivingFacility', 'Facility X');
    });

    it('should provide override default options', function () {
        let engine = new SampleEngine({
            speed: 'Fast', mode: 'Sequential'
        }, {
            application: 'tester',
            facility: 'tests',
            messageType: 'OOO',
            version: '2.2',
            receivingApplication: 'Application Y',
            receivingFacility: 'Facility Y'
        });
        engine.options.should.have.property('speed', 'Fast');
        engine.options.should.have.property('mode', 'Sequential');

        engine.defaultMessageOptions.should.have.property('application', 'tester');
        engine.defaultMessageOptions.should.have.property('facility', 'tests');
        engine.defaultMessageOptions.should.have.property('messageType', 'OOO');
        engine.defaultMessageOptions.should.have.property('version', '2.2');
        engine.defaultMessageOptions.should.have.property('receivingApplication', 'Application Y');
        engine.defaultMessageOptions.should.have.property('receivingFacility', 'Facility Y');
    });

    it('should initialize a default driver and emit ready', function (done) {
        let engine = new SampleEngine();
        engine.once('ready', done);
        engine.once('error', done);
    });

    it('should return a new message builder from getMessageBuilder', function () {
        let engine  = new SampleEngine();
        let builder = engine.getMessageBuilder({ messageEvent: 'A01' });
        builder.should.be.instanceof(Builder.Message);
    });

    it('should throw from getMessageBuilder without an event', function () {
        (function () {
            let engine  = new SampleEngine();
            engine.getMessageBuilder();
        }).should.throw();
    });

    it('should return a random timeout between intervals based on speed', function () {
        let engine = new SampleEngine();
        engine.getTimeout().should.not.equal(engine.getTimeout());
    });

    it('should return the same timeout if the speed is load testing', function () {
        let engine = new SampleEngine({ speed: 'LoadTest' });
        engine.getTimeout().should.equal(engine.getTimeout());
    });

    it('should return a custom timeout', function () {
        let engine = new SampleEngine({ speed: { min: 1, max: 1 } });
        for (let i = 0; i < 10; i++) {
            engine.getTimeout().should.equal(1);
        }

        engine = new SampleEngine({ speed: { min: 10, max: 100 } });
        for (let i = 0; i < 10; i++) {
            let timeout = engine.getTimeout();
            timeout.should.be.above(9);
            timeout.should.be.below(100);
        }
    });

    describe('getAvailablePatient', function () {
        it('should get new patients from getAvailablePatient(existing=false)', function (done) {
            let engine = new SampleEngine();
            let previousPatientId = -1;
            let previousVisitId = -1;

            function test(count) {
                if (count >= 5) {
                    return done();
                }
                engine.getAvailablePatient(function (error, patient, visit) {
                    should.not.exist(error);
                    previousPatientId.should.not.equal(patient.id);
                    previousPatientId = patient.id;
                    previousVisitId.should.not.equal(visit.id);
                    previousVisitId = visit.id;
                    test(count + 1);
                });
            }

            engine.once('ready', function () {
                test(0);
            });
        });

        it('should get a new patient from getAvailablePatient(existing=true) when one does not exist', function (done) {
            let engine = new SampleEngine();

            engine.once('ready', function () {
                engine.getAvailablePatient(true, function (error, patient, visit) {
                    should.not.exist(error);
                    should.exist(patient);
                    should.exist(visit);
                    done();
                });
            });
        });

        it('should return existing patient from getAvailablePatient(existing=true) when one exists', function (done) {
            let engine = new SampleEngine();

            engine.once('ready', function () {
                engine.getAvailablePatient(function (error, patient, visit) {
                    should.not.exist(error);

                    engine.getAvailablePatient(true, function (error2, patient2, visit2) {
                        should.not.exist(error2);
                        patient2.id.should.equal(patient.id);
                        visit2.id.should.equal(visit.id);
                        done();
                    });
                });
            });
        });

        it('should throw an error if maximumActivePatients is less than 1', function () {
            (() =>
                new SampleEngine({ maximumActivePatients: 0 })
            ).should.throw();
        });

        it('should only add 1 patient if maximumActivePatients equals 1', function () {
            let engine = new SampleEngine({ maximumActivePatients: 1 });
            engine.once('ready', function () {
                engine.getAvailablePatient(false, function (error, patient, visit) {
                    should.not.exist(error);
                    engine.getAvailablePatient(false, function (error2, patient2, visit2) {
                        should.not.exist(error2);

                        patient.id.should.equal(patient2.id);
                        visit.id.should.equal(visit2.id);
                    });
                });
            });
        });

        it('should add 2 different patients if maximumActivePatients is greater than 1', function () {
            let engine = new SampleEngine({ maximumActivePatients: 2 });
            engine.once('ready', function () {
                engine.getAvailablePatient(false, function (error, patient, visit) {
                    should.not.exist(error);
                    engine.getAvailablePatient(false, function (error2, patient2, visit2) {
                        should.not.exist(error2);

                        patient.id.should.not.equal(patient2.id);
                        visit.id.should.not.equal(visit2.id);
                    });
                });
            });
        });
    });

    describe('consume', function () {
        it('should send messages when consuming', function (done) {
            let engine = new SampleEngine({ speed: 'LoadTest' });

            engine.once('ready', function () {
                let count = 0;
                engine.on('message', function (message) {
                    if (message.indexOf('MSH|') === 0) {
                        count = count + 1;
                    }
                    if (count === 2) {
                        engine.stop();
                        return done();
                    }
                });
                engine.consume();
                engine.consuming.should.equal(true);
            });
        });

        it('should consuming after calling stop', function (done) {
            let engine = new SampleEngine({ speed: 'Medium' });

            engine.once('ready', function () {
                let count = 0;
                engine.on('message', function (message) {
                    if (message.indexOf('MSH|') === 0) {
                        count = count + 1;
                    }
                    if (count > 0) {
                        engine.stop();
                        engine.consuming.should.equal(false);
                        return done();
                    }
                });
                engine.consume();
            });
        });
    });
});
