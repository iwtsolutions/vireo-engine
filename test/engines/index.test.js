'use strict';
require('should');
var Engines = require('../../lib/engines/index');

describe('Index', function () {
    it('should expose ADT and Order engines', function () {
        Engines.should.have.property('ADT');
        Engines.should.have.property('Order');
        Engines.should.not.have.property('Base');
        Engines.should.not.have.property('BaseEngine');
    });

    it('should not be able to construct a BaseEngine', function () {
        (() => new Engines.BaseEngine()).should.throw();
    });
});
