module.exports.toDateString = toDateString;
module.exports.toTimeString = toTimeString;
module.exports.toFullString = toFullString;

function toDateString(date) {
    if (!date || (date instanceof Date) === false) {
        return '';
    }

    return date.getFullYear() +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        ('0' + date.getDate()).slice(-2);
}

function toTimeString(date) {
    if (!date || (date instanceof Date) === false) {
        return '';
    }

    return ('0' + date.getHours()).slice(-2) +
        ('0' + date.getMinutes()).slice(-2) +
        ('0' + date.getSeconds()).slice(-2);
}


function toFullString(date) {
    if (!date || (date instanceof Date) === false) {
        return '';
    }

    return toDateString(date) + toTimeString(date);
}
