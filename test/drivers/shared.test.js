'use strict';
var should = require('should');

module.exports = function () {
    before(function (done) {
        let self = this;
        function createSamplePatient(index, prefix) {
            if (index === 10) {
                if (prefix === 'main') {
                    return createSamplePatient(0, 'secondary');
                }
                return done();
            }
            let pt = new self.driver.models.patient({
                mrn: prefix + index,
                phone: prefix === 'main' ? '111-111-1111'  : '222-222-2222'
            });
            pt.save(function (error) {
                if (error) {
                    return done(error);
                }
                createSamplePatient(index + 1, prefix);
            });
        }
        createSamplePatient(0, 'main');
    });
    it('should save a message to the message collection', function (done) {
        let self = this;
        let data = {
            mrn: '15',
            account: '16',
            type: 'A01',
            hl7: 'MSH|...'
        };
        this.driver.models.message.save(data, function (error) {
            should.not.exist(error);
            self.driver.models.message.find({ mrn: '15', account: '16' }, function (messageHistoryError, results) {
                should.not.exist(messageHistoryError);
                results.length.should.equal(1);
                results[0].should.have.property('mrn', '15');
                results[0].should.have.property('account', '16');
                results[0].should.have.property('type', 'A01');
                results[0].should.have.property('hl7', 'MSH|...');
                results[0].should.have.property('timestamp');
                results[0].should.have.property('id');
                done();
            });
        });
    });

    it('should find one', function (done) {
        let data = { mrn: '1' };
        let self = this;
        this.driver.models.patient.save(data, function (saveError) {
            should.not.exist(saveError);
            self.driver.models.patient.findOne({ mrn: '1' }, function (findError, result) {
                should.not.exist(findError);
                result.should.have.property('mrn', '1');
                done();
            });
        });
    });

    it('should save updates to a model from obj.save()', function (done) {
        let data = {
            mrn: '456',
            name: {
                family: 'Ross'
            }
        };
        let self = this;
        this.driver.models.patient.save(data, function (saveError) {
            should.not.exist(saveError);
            self.driver.models.patient.findOne({ mrn: '456' }, function (findError, result) {
                if (findError) {
                    return done(findError);
                }
                result.should.have.property('mrn', '456');
                result.should.have.property('name');
                result.name.should.have.property('family', 'Ross');
                result.name.should.not.have.property('given');

                result.name.family = 'Carter';
                result.name.given = 'Jimmy';
                result.save(function (updateError) {
                    if (updateError) {
                        return done(updateError);
                    }

                    self.driver.models.patient.find({ mrn: '456' }, function (findUpdatedError, updatedResults) {
                        if (findUpdatedError) {
                            return done(findUpdatedError);
                        }
                        updatedResults.length.should.equal(1);
                        updatedResults[0].should.have.property('mrn', '456');
                        updatedResults[0].should.have.property('name');
                        updatedResults[0].name.should.have.property('family', 'Carter');
                        updatedResults[0].name.should.have.property('given', 'Jimmy');
                        done();
                    });
                });
            });
        });
    });

    it('should validate mrn exists before saving a patient', function (done) {
        this.driver.models.patient.save({ }, function (saveError) {
            should.exist(saveError);
            done();
        });
    });

    it('should create and save a patient, and get an id', function (done) {
        let patient = new this.driver.models.patient();
        patient.save(function (error) {
            should.not.exist(error);
            should.exist(patient.id);
            should.exist(patient.timestamp);
            done();
        });
    });

    it('should return models instead of anonymous objects with find', function (done) {
        let data = { mrn: '1' };
        let self = this;
        this.driver.models.patient.save(data, function (saveError) {
            should.not.exist(saveError);
            self.driver.models.patient.find({ mrn: '1' }, function (findError, results) {
                should.not.exist(findError);
                results.forEach(function (r) {
                    r.should.be.instanceof(self.driver.models.patient);
                });
                done();
            });
        });
    });

    it('should return models instead of anonymous objects with findOne', function (done) {
        let data = { mrn: '1' };
        let self = this;
        this.driver.models.patient.save(data, function (saveError) {
            should.not.exist(saveError);
            self.driver.models.patient.findOne({ mrn: '1' }, function (findError, result) {
                should.not.exist(findError);
                result.should.be.instanceof(self.driver.models.patient);
                done();
            });
        });
    });

    it('should return a count of all from .count', function (done) {
        this.driver.models.patient.count(function (error, count) {
            if (error) {
                return done(error);
            }
            count.should.be.above(19);
            done();
        });
    });

    it('should return a count of filtered from .count', function (done) {
        this.driver.models.patient.count({ phone: '111-111-1111' }, function (error, count) {
            if (error) {
                return done(error);
            }
            count.should.equal(10);
            done();
        });
    });

    it('should find filtered random records with findRandom', function (done) {
        let self = this;

        // 10 values in 'patient' may still return the same results..
        function findTwoRandomValues(index) {
            if (index === 3) {
                return done('random values not found..');
            }
            self.driver.models.patient.findRandom({ phone: '111-111-1111' }, function (error, patient) {
                if (error) {
                    return done(error);
                }
                patient.phone.should.equal('111-111-1111');
                self.driver.models.patient.findRandom({ phone: '111-111-1111' }, function (error2, patient2) {
                    if (error2) {
                        return done(error2);
                    }
                    patient2.phone.should.equal('111-111-1111');
                    if (patient.mrn !== patient2.mrn) {
                        return done();
                    }
                    findTwoRandomValues(index + 1);
                });
            });
        }
        findTwoRandomValues(0);
    });

    it('should find non-filtered random records with findRandom', function (done) {
        let self = this;

        // 20 values in 'patient' may still return the same results..
        function findTwoRandomValues(index) {
            if (index === 5) {
                return done('random values not found..');
            }
            self.driver.models.patient.findRandom(function (error, patient) {
                if (error) {
                    return done(error);
                }
                self.driver.models.patient.findRandom(function (error2, patient2) {
                    if (error2) {
                        return done(error2);
                    }
                    if (patient.mrn !== patient2.mrn && patient.phone !== patient2.phone) {
                        return done();
                    }
                    findTwoRandomValues(index + 1);
                });
            });
        }
        findTwoRandomValues(0);
    });
};
