require('should');
var models = require('../../lib/models/index');

describe('Models', function () {
    it('should expose all models', function () {
        models.should.have.property('patients');
        models.should.have.property('visits');
        models.should.have.property('messages');
    });
});
