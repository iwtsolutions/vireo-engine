'use strict';
var fs        = require('fs');
var path      = require('path');

var models = {};
var modelsDirectory = path.join(__dirname);
var modelNames = fs.readdirSync(modelsDirectory);

modelNames.forEach(function (name) {
    if (name.indexOf('index') === -1 && name.indexOf('base-model') === -1) {
        let modelPath = path.join(modelsDirectory, name);
        if (name.indexOf('.js') > -1) {
            name = name.substring(0, name.length - 3);
        }
        let model = require(modelPath); // eslint-disable-line global-require

        Object.keys(model.schema).forEach(function (k) {
            if (typeof model.schema[k] === 'string') {
                model.schema[k] = { type: model.schema[k] };
            }
            model.schema[k].type = model.schema[k].type || 'string';
            model.schema[k].required = model.schema[k].required || false;
        });

        models[name] = model;
    }
});

module.exports = models;
