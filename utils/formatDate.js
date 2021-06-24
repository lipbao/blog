function dateForm(time) {
    let year = time.getFullYear(),
        month = getTenNum(time.getMonth() + 1),
        day = getTenNum(time.getDate());

    return year + '/' + month + '/' + day
}

function getTenNum(num) {
    if (num < 10) {
        return '0' + num
    } else {
        return num
    }
}

exports.dateForm = dateForm