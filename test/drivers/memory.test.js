require('should');
var sharedTests  = require('./shared.test');
var MemoryDriver = require('../../lib/drivers/memory');

describe('MemoryDriver', function () {
    before(function (done) {
        this.driver = new MemoryDriver();
        this.driver.once('ready', done);
        this.driver.once('error', done);
    });

    sharedTests.call(this);
    it('should initialize arrays for collections', function () {
        this.driver.should.have.property('collections');
        this.driver.collections.should.have.property('patients');
    });
});
