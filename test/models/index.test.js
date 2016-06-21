require('should');
var models = require('../../lib/models/index');

describe('Models', function () {
    it('should expose all models', function () {
        models.should.have.property('patient');
        models.patient.should.have.property('schema');
        models.should.have.property('visit');
        models.visit.should.have.property('schema');
        models.should.have.property('message');
        models.message.should.have.property('schema');
    });
});
