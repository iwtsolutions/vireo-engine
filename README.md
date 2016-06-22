Vireo Engine
============

Vireo is an HL7 engine simulator to generate random and configurable data for testing purposes. All data generated is simulated and faked.

## Setup

    npm install

## Tests

    grunt           // runs eslint & mochaTest
    grunt lint      // runs eslint only
    grunt mocha     // runs mocha tests only

## Usage

    var vireo = require('../vireo-engine');

    let connectionOptions = {
        host: 'localhost',
        port: 28015,
        db: 'vireotests',
        user: 'admin',
        password: ''
    };

    let adt = new vireo.Engines.ADT({
        speed: 'Medium',
        mode: 'Simulated',
        driverType: 'rethink',
        connectionOptions: connectionOptions
    }, {
        receivingApplication: 'MatthsApp',
        receivingFacility: 'Matth',
        version: '2.2.2'
    });

    adt.on('ready', function () {
        adt.on('message', function (message) {
            console.log(message);
            console.log();
        });

        adt.consume();
    });
