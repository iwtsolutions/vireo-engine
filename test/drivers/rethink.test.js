'use strict';
var should        = require('should');
var r             = require('rethinkdb');
var sharedTests   = require('./shared.test');
var RethinkDriver = require('../../lib/drivers/rethink');

const dbName = 'grunttests';

describe('RethinkDriver', function () {
    before(function (done) {
        this.driver = new RethinkDriver({
            db: dbName
        });

        this.driver.once('ready', done);
        this.driver.once('error', done);
    });

    after(function (done) {
        var self = this;
        r.dbList().run(this.driver.connection, function (error, dbs) {
            should.not.exist(error);
            if (dbs.indexOf(dbName) > -1) {
                return r.dbDrop(dbName).run(self.driver.connection, done);
            }
            done();
        });
    });

    sharedTests.call(this);
    it('should initialize tables', function (done) {
        r.tableList().run(this.driver.connection, function (error, tables) {
            should.not.exist(error);

            tables.should.containEql('patients');
            tables.should.containEql('visits');
            tables.should.containEql('messages');
            done();
        });
    });
});
