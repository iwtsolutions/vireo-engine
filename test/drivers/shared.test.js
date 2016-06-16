var should = require('should');

module.exports = function () {
    it('should save a message to the messages collection', function (done) {
        var self = this;
        this.driver.saveMessage('15', '16', 'A01', 'MSH|...', function (error) {
            should.not.exist(error);
            self.driver.getMessageHistory({ mrn: '15', account: '16' }, function (messageHistoryError, results) {
                should.not.exist(messageHistoryError);
                results.length.should.equal(1);
                results[0].should.have.property('mrn', '15');
                results[0].should.have.property('account', '16');
                results[0].should.have.property('type', 'A01');
                results[0].should.have.property('hl7', 'MSH|...');
                results[0].should.have.property('timestamp');
                done();
            });
        });
    });
};
