Vireo Engine
============

Vireo is an HL7 engine simulator to generate random and configurable data for testing purposes. All data generated is simulated and faked.

## Node.js Version

Minimum: v6.0.0

## Setup

    npm install

## Tests

    grunt           // runs eslint & mochaTest
    grunt lint      // runs eslint only
    grunt mocha     // runs mocha tests only

## Usage

#### Consumptions

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

#### Get Random messages

    var vireo = require('../vireo-engine');

    let adt = new vireo.Engines.ADT({
        receivingApplication: 'MatthsApp',
        receivingFacility: 'Matth',
        version: '2.2.2'
    });

    let message = adt.getRandom();
    console.log(message);

## API

### Drivers

Drivers are used for storing simulation data for later use. Available drivers:

* Memory - Does not persist after the proces has stopped.
* RethinkDB
* TODO MongoDB

### Engines

Options: 

* `speed` - Speed to wait before sending a new message
    * `Slow` - 10-20s
    * `Medium` - 2500-5000ms
    * `Fast` - 500-1750ms
    * `LoadTest` - 10ms
    * `Custom` (object):
        * min: Minimum millseconds between messages (default 1)
        * max: Maximum millseconds between messages (default 10)
* Mode
    * `Simulated` - Acts as a real system with specific sequence of messages against existing and new patients
    * `Random` - Randomly sends messages
    * `maximumActivePatients` - Maximum active visit records in a hospital

#### ADT

Generates various ADT events. Not all are supported.

Options:

* `newPatientProbability`: Percent change of creating a new patient instead of using an existing one

#### Order

* TODO
