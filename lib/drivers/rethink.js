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
        for (let key in defaultConnectionOptions) {
            if (this.connectionOptions.hasOwnProperty(key) === false) {
                this.connectionOptions[key] = defaultConnectionOptions[key];
            }
        }
    }
    initializeCollections(models, callback) {
        let self = this;
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
                let modelNames = Object.keys(models);
                createModels(connection, db, modelNames, callback);
            });
        });
    }
    getSaveFunc(modelName) {
        let self = this;
        return function save(data, callback) {
            if (data.hasOwnProperty('id')) {
                return r.table(modelName)
                    .get(data.id)
                    .update(data)
                    .run(self.connection, function (error, result) {
                        if (error) {
                            return callback(error);
                        }
                        if (result.errors > 0) {
                            return callback(result.first_error);
                        }
                        callback();
                    });
            }

            r.table(modelName)
                .insert(data)
                .run(self.connection, function (error, result) {
                    if (result.hasOwnProperty('generated_keys') && result.generated_keys.length > 0) {
                        data.id = result.generated_keys[0];
                    }
                    if (error) {
                        return callback(error);
                    }
                    if (result.errors > 0) {
                        return callback(result.first_error);
                    }
                    callback();
                });
        };
    }
    getFindFunc(modelName) {
        let self = this;
        return function find(query, start, limit, callback) {
            r.table(modelName)
                .filter(query)
                .orderBy('timestamp')
                .skip(start)
                .limit(limit)
                .run(self.connection, callback);
        };
    }
    getFindOneFunc(modelName) {
        let self = this;
        return function findOne(query, callback) {
            r.table(modelName)
                .filter(query)
                .orderBy('timestamp')
                .limit(1)
                .run(self.connection, function (error, results) {
                    if (error) {
                        return callback(error);
                    }
                    callback(null, results.length > 0 ? results[0] : null);
                });
        };
    }
    getCountFunc(modelName) {
        let self = this;
        return function getCount(query, callback) {
            r.table(modelName)
                .filter(query)
                .count()
                .run(self.connection, function (error, count) {
                    if (error) {
                        return callback(error);
                    }
                    callback(null, count);
                }
            );
        };
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
