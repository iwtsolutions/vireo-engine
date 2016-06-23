'use strict';
class BaseModel {
    constructor(obj = {}) {
        if (obj.hasOwnProperty('id')) {
            this.id = obj.id;
        }
        this.timestamp = obj.timestamp;
    }
}
module.exports = BaseModel;
