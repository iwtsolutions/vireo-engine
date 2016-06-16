'use strict';
var r          = require('rethinkdb');
var BaseDriver = require('./base-driver');

var defaultConnectionOptions = {
    host: 'localhost',
    port: 28015,
    db: 'vireo',
    user: 'admin',
    password: ''
};

class RethinkDriver extends BaseDriver {
    constructor(connectionOptions) {
        super();
        this.connectionOptions = connectionOptions;
        for (var key in defaultConnectionOptions) {
            if (this.connectionOptions.hasOwnProperty(key) === false) {
                this.connectionOptions[key] = defaultConnectionOptions[key];
            }
        }
    }
    initializeCollections(models, callback) {
        var self = this;
        let db = this.connectionOptions.db;
        r.connect(this.connectionOptions, function (error, connection) {
            if (error) {
                return callback(error);
            }
            self.connection = connection;
            createDatabase(connection, db, function (dbCreateError) {
                if (dbCreateError) {
                    return callback(dbCreateError);
                }
                var modelNames = Object.keys(models);
                createModels(connection, db, modelNames, callback);
            });
        });
    }
    save(collection, data, callback) {
        r.table(collection).insert(data).run(this.connection, callback);
    }
    find(collection, query, start, limit, callback) {
        var self = this;
        r.table(collection)
            .filter(query)
            .orderBy('timestamp')
            .skip(start)
            .limit(limit)
            .run(self.connection, callback);
    }
}

function createDatabase(connection, db, callback) {
    r.dbList().run(connection, function (listError, databases) {
        if (listError) {
            return callback(listError);
        }
        if (databases.indexOf(db) > -1) {
            return callback();
        }
        r.dbCreate(db).run(connection, callback);
    });
}

function createModels(connection, db, modelNames, callback) {
    function createModel(index, tables) {
        if (index === modelNames.length) {
            return callback();
        }

        if (tables.indexOf(modelNames[index]) > -1) {
            return createModel(index + 1, tables);
        }
        r.db(db).tableCreate(modelNames[index]).run(connection, function (createError) {
            if (createError) {
                return callback(createError);
            }
            createModel(index + 1, tables);
        });
    }
    r.db(db).tableList().run(connection, function (listError, tables) {
        if (listError) {
            return callback(listError);
        }
        createModel(0, tables);
    });
}

module.exports = RethinkDriver;
