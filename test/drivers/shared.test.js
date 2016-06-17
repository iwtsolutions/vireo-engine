'use strict';
var should = require('should');

module.exports = function () {
    it('should save a message to the messages collection', function (done) {
        let self = this;
        let data = {
            mrn: '15',
            account: '16',
            type: 'A01',
            hl7: 'MSH|...'
        };
        this.driver.models.messages.save(data, function (error) {
            should.not.exist(error);
            self.driver.models.messages.find({ mrn: '15', account: '16' }, function (messageHistoryError, results) {
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
        var self = this;
        this.driver.models.patients.save(data, function (saveError) {
            should.not.exist(saveError);
            self.driver.models.patients.findOne({ mrn: '1' }, function (findError, result) {
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
        var self = this;
        this.driver.models.patients.save(data, function (saveError) {
            should.not.exist(saveError);
            self.driver.models.patients.findOne({ mrn: '456' }, function (findError, result) {
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

                    self.driver.models.patients.find({ mrn: '456' }, function (findUpdatedError, updatedResults) {
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
        this.driver.models.patients.save({ }, function (saveError) {
            should.exist(saveError);
            done();
        });
    });
};
