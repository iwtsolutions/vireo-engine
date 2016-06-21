var random = require('./random');

// Not all events will be listed yet.
module.exports.adt = function (previousEvent) {
    // TODO: Add configurable weights per message.
    switch (previousEvent) {
        case 'A01': // admit
        case 'A02': // transfer
        case 'A12': // cancel transfer
        case 'A17': // swap patients
        case 'A18': // merge patient
        case 'A20': // bed status update
        case 'A22': // return from loa
        case 'A25': // cancel pending discharge
        case 'A26': // cancel pending transfer
            return random.selectRandom([ 'A02', 'A03', 'A07', 'A08', 'A12', 'A15', 'A16', 'A15', 'A20',
                'A21', 'A28', 'A31'
            ]);
        case 'A04': // register patient
            return random.selectRandom([ 'A01', 'A05', 'A08', 'A14', 'A28', 'A31' ]);
        case 'A05': // pre admit
            return random.selectRandom([ 'A06', 'A08', 'A28', 'A31', 'A38' ]);
        case 'A14': // pending transfer
            return random.selectRandom([ 'A01', 'A08', 'A27', 'A31' ]);
        case 'A15': // pending transfer
            return random.selectRandom([ 'A02', 'A08', 'A26', 'A31' ]);
        case 'A16': // pending discharge
            return random.selectRandom([ 'A03', 'A08', 'A25', 'A31' ]);
        case 'A21': // leave of absence
            return random.selectRandom([ 'A08', 'A22', 'A28', 'A31' ]);
        default:
             // Admit-like events
            return random.selectRandom([ 'A01', 'A04', 'A05', 'A14' ]);
    }
};
