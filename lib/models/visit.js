'use strict';
var date      = require('../helpers/date');
var random    = require('../helpers/random');
var Builder   = require('hl7-builder');
var BaseModel = require('./base-model');

class Visit extends BaseModel {
    constructor(visit = {}) {
        super(visit);
        this.patientId = visit.patientId;
        this.account = visit.account || random.getRandomPatientIdentifier();
        this.class = visit.class || random.visit.class();
        this.location = visit.location || random.visit.location();
        this.admitType = visit.admitType || random.visit.admitType();
        this.previousLocation = visit.previousLocation || {
            nurse: '',
            room: '',
            bed: ''
        };
        this.admittingDoctor = visit.admittingDoctor || random.visit.doctor();
        this.referringDoctor = visit.referringDoctor || random.visit.doctor();

        if (visit.consultingDoctors) {
            this.consultingDoctors = visit.consultingDoctors;
        } else {
            this.consultingDoctors = {};
            let doctorCount = random.getRandomInteger(1, 10);
            for (let i = 0; i < doctorCount; i++) {
                let doctor = random.visit.doctor();
                this.consultingDoctors[doctor.code] = doctor;
            }
        }
        this.hospitalService = visit.hospitalService || random.visit.hospitalService();
        this.admitSource = visit.admitSource || random.visit.admitSource();
        this.attendingDoctor = visit.attendingDoctor || random.visit.doctor();
        this.admitDate = visit.admitDate || null;
        this.dischargeDate = visit.dischargeDate || null;

        if (this.admitDate instanceof Date) {
            this.admitDate = date.toFullString(this.admitDate);
        }
        if (this.dischargeDate instanceof Date) {
            this.dischargeDate = date.toFullString(this.dischargeDate);
        }
    }
    setRandomLocation() {
        let newLocation = random.visit.location();
        this.setLocation(newLocation.nurse, newLocation.room, newLocation.bed);
    }
    setLocation(nurse, room, bed) {
        this.previousLocation = {
            nurse: this.location.nurse,
            room: this.location.room,
            bed: this.location.bed
        };
        this.location = {
            nurse: nurse || '',
            room: room || '',
            bed: bed || ''
        };
    }
    clearLocation() {
        this.previousLocation = {
            nurse: '',
            room: '',
            bed: ''
        };
        this.location = {
            nurse: '',
            room: '',
            bed: ''
        };
    }
    setAdmitDate(admitDate) {
        if (admitDate) {
            if (admitDate instanceof Date) {
                this.admitDate = date.toFullString(admitDate);
            } else if (typeof admitDate === 'string') {
                this.admitDate = admitDate;
            }
        } else {
            this.admitDate = null;
        }
    }
    setDischargeDate(dischargeDate) {
        if (dischargeDate) {
            if (dischargeDate instanceof Date) {
                this.dischargeDate = date.toFullString(dischargeDate);
            } else if (typeof dischargeDate === 'string') {
                this.dischargeDate = dischargeDate;
            }
        } else {
            this.dischargeDate = null;
        }
    }
    toSegment() {
        let segment = new Builder.Segment('PV1');

        segment.set(2, this.class);
        segment.set(3, getLocationField(this.location));
        segment.set(4, this.admitType);
        segment.set(6, getLocationField(this.previousLocation));
        segment.set(7, buildDoctorField(this.attendingDoctor));
        segment.set(8, buildDoctorField(this.referringDoctor));
        segment.set(9, getDoctorField(this.consultingDoctors));
        segment.set(10, this.hospitalService);
        segment.set(14, this.admitSource);
        segment.set(17, buildDoctorField(this.admittingDoctor));
        segment.set(44, this.admitDate);
        segment.set(45, this.dischargeDate);

        return segment;
    }
}

function getLocationField(location) {
    let field = new Builder.Field();
    if (location.nurse) {
        field.set(0, location.nurse);
    }
    if (location.room) {
        field.set(1, location.room);
    }
    if (location.bed) {
        field.set(2, location.bed);
    }
    return field;
}

function getDoctorField(doctors) {
    let field = new Builder.Field();
    let doctorKeys = Object.keys(doctors);

    for (let i = 0; i < doctorKeys.length; i++) {
        field = buildDoctorField(doctors[doctorKeys[i]], field);
        if (i + 1 < doctorKeys.length) {
            field.repeat();
        }
    }
    return field;
}

function buildDoctorField(doctor, field) {
    if (!field) {
        field = new Builder.Field();
    }
    field.set(0, doctor.code);
    field.set(1, doctor.family);
    field.set(2, doctor.given);
    field.set(3, doctor.middle);
    field.set(6, doctor.degree);
    return field;
}

Visit.schema = {
    patientId: { type: 'reference', model: 'patient', required: true },
    account: { type: 'string', required: true },
    class: 'string',
    location: {
        nurse: 'string',
        room: 'string',
        bed: 'string'
    },
    admitType: 'string',
    previousLocation: {
        nurse: 'string',
        room: 'string',
        bed: 'string'
    },
    admittingDoctor: {
        code: 'string',
        family: 'string',
        given: 'string',
        degree: 'string'
    },
    referringDoctor: {
        code: 'string',
        family: 'string',
        given: 'string',
        degree: 'string'
    },
    consultingDoctors: Array,
    attending: {
        code: 'string',
        family: 'string',
        given: 'string',
        degree: 'string'
    },
    hospitalService: 'string',
    admitSource: 'string',
    admitDate: 'string',
    dischargeDate: 'string'
};

module.exports = Visit;
