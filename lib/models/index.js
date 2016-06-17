var fs        = require('fs');
var path      = require('path');
var pluralize = require('pluralize');

var models = {};
var modelsDirectory = path.join(__dirname);
var modelNames = fs.readdirSync(modelsDirectory);

modelNames.forEach(function (name) {
    if (name.indexOf('index') === -1) {
        var modelPath = path.join(modelsDirectory, name);
        if (name.indexOf('.js') > -1) {
            name = name.substring(0, name.length - 3);
        }
        var collectionName = pluralize(name);
        var model = require(modelPath); // eslint-disable-line global-require

        Object.keys(model).forEach(function (k) {
            if (typeof model[k] === 'string') {
                model[k] = { type: model[k] };
            }
            model[k].type = model[k].type || 'string';
            model[k].required = model[k].required || false;
        });

        models[collectionName] = model;
    }
});

module.exports = models;
