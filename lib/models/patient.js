module.exports = {
    mrn: { type: 'string', required: true, unique: true },
    name: {
        family: 'string',
        given: 'string',
        middle: 'string'
    },
    dob: 'string',
    sex: 'string'
};
