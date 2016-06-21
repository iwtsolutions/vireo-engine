'use strict';
require('should');
var date    = require('../../lib/helpers/date');
var message = require('../../lib/models/message');

describe('Message', function () {
    it('should initialize an message object with empty string properties', function () {
        let m = new message();
        m.should.have.property('mrn', '');
        m.should.have.property('account', '');
        m.should.have.property('type', '');
        m.should.have.property('event', '');
        m.should.have.property('hl7', '');
        m.should.have.property('timestamp', '');
    });

    it('should initialize an message object with given values', function () {
        let m = new message({
            mrn: '111',
            account: '222',
            type: 'ADT',
            event: 'A01',
            hl7: 'MSH|..',
            timestamp: new Date()
        });
        m.should.have.property('mrn', '111');
        m.should.have.property('account', '222');
        m.should.have.property('type', 'ADT');
        m.should.have.property('event', 'A01');
        m.should.have.property('hl7', 'MSH|..');
        m.should.have.property('timestamp', date.toFullString(new Date()));
    });
});
