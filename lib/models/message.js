'use strict';
var date = require('../helpers/date');

class Message {
    constructor(dbObject) {
        dbObject = dbObject || {};
        this.mrn = dbObject.mrn || '';
        this.account = dbObject.account || '';
        this.type = dbObject.type || '';
        this.event = dbObject.event || '';
        this.hl7 = dbObject.hl7 || '';
        this.timestamp = dbObject.timestamp || '';

        if (this.timestamp instanceof Date) {
            this.timestamp = date.toFullString(this.timestamp);
        }
    }
}

Message.schema = {
    mrn: 'string',
    account: 'string',
    type: 'string',
    event: 'string',
    hl7: 'string',
    timestamp: 'date'
};

module.exports = Message;
