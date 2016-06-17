module.exports = {
    patient: { type: 'reference', model: 'patient', required: true },
    class: 'string',
    account: { type: 'string', required: true }
};
