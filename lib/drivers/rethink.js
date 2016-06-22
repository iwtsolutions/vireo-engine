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
    getTransformedQuery(query) {
        return function (obj) {
            let filter = null;
            for (let key in query) {
                if (!query[key]) {
                    filter = appendFilter(filter, obj.hasFields(key).not());
                } else if (query[key].constructor === Object) {
                    for (let innerKey in query[key]) {
                        let comparison = getInnerComparison(obj, key, innerKey);
                        if (comparison) {
                            filter = appendFilter(filter, comparison);
                        }
                    }
                } else {
                    filter = appendFilter(filter, obj(key).eq(query[key]));
                }
            }
            return filter || true;
        };
        function appendFilter(filter, comparison) {
            if (filter) {
                return filter.and(comparison);
            }
            return comparison;
        }
        function getInnerComparison(obj, key, innerKey) {
            if (innerKey === 'ne') {
                return obj(key).ne(query[key][innerKey]);
            }
            if (innerKey === 'exists') {
                let comparison = obj.hasFields(key);
                return query[key][innerKey] ? comparison : comparison.not();
            }
            if (innerKey === 'in') {
                return r.expr(query[key][innerKey]).contains(obj(key));
            }
            if (innerKey === 'nin') {
                return r.expr(query[key][innerKey]).contains(obj(key)).not();
            }
        }
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
                .orderBy(r.desc('timestamp'))
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
                .orderBy(r.desc('timestamp'))
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
