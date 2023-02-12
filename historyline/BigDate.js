"use strict";

/**
 * Внимание! Внутреннее представление месяцев и дней месяца начинается с нуля.
 */
function BigDate(year, month, day, hour, minute, second) {
    if (typeof year == 'undefined') {
        this.fromDate(new Date());
    } else {
        this.year = typeof (year) != 'undefined' ? parseInt(year) : 0; // zero equals christ 00-00-0000
        this.month = typeof (month) != 'undefined' ? parseInt(month) - 1 : 0; // month number (0 - 11)
        this.day = typeof (day) != 'undefined' ? parseInt(day) - 1 : 0; // day number of the month (0 - 30)
        this.hour = typeof (hour) != 'undefined' ? parseInt(hour) : 0; // 0 - 23
        this.minute = typeof (minute) != 'undefined' ? parseInt(minute) : 0; // 0 - 59
        this.second = typeof (second) != 'undefined' ? parseInt(second) : 0; // 0 - 59
    }
};

BigDate.YEAR = 0;
BigDate.MONTH = 1;
BigDate.DAY = 2;
BigDate.HOUR = 3;
BigDate.MINUTE = 4;
BigDate.SECOND = 5;

/**
 * Получение какого-либо параметры даты (года, дня, ...)
 */
BigDate.prototype.get = function (param) {
    switch (param) {
        case BigDate.YEAR: return this.year; break;
        case BigDate.MONTH: return this.month; break;
        case BigDate.DAY: return this.day; break;
        case BigDate.HOUR: return this.hour; break;
        case BigDate.MINUTE: return this.minute; break;
        case BigDate.SECOND: return this.second; break;
    }
}

/**
 * Получение каого-либо параметра даты с повышенной точностью
 */
BigDate.prototype.getPlus = function (param, precision) {
    if (typeof precision == 'undefined') {
        precision = 0;
    }

    switch (param) {
        case BigDate.YEAR: return this.year + this.getPlus(BigDate.MONTH) / 12; break;
        case BigDate.MONTH: return this.month + this.getPlus(BigDate.DAY) / 31; break;
        case BigDate.DAY: return this.day + this.getPlus(BigDate.HOUR) / 24; break;
        case BigDate.HOUR: return this.hour + this.getPlus(BigDate.MINUTE) / 60; break;
        case BigDate.MINUTE: return this.minute + this.getPlus(BigDate.SECOND) / 60; break;
        case BigDate.SECOND: return this.second; break;
    }
}

/**
 * Получение "большой" даты из обычной
 */
BigDate.prototype.fromDate = function (date) {
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.day = date.getDate() - 1;
    this.hour = date.getHours();
    this.minute = date.getMinutes();
    this.second = date.getSeconds();
}


/**
 * Получение обычной даты из "большой" (если это возможно)
 */
BigDate.prototype.getDate = function () {
    // -8640000000000000 (Tue Apr 20 -271821 03:00:00 GMT+0300) - min date in js
    //  8640000000000000 (Sat Sep 13  275760 03:00:00 GMT+0300) - max date in js

    if (-271820 < this.year && this.year < 275759) {
        var d = new Date(this.year, this.month);

        if (0 <= this.year && this.year <= 99) {
            // this is javascript, baby :)
            d.setFullYear(this.year, 0);
        }

        return d;
    } else {
        // value is outside possible Date range
        return null;
    }
}

BigDate.prototype.toString = function () {
    var align = function (num, size) {
        var val = String(parseInt(num, 10));
        while (val.length < size) {
            val = "0" + val;
        }
        return val;
    }

    return align(this.day + 1, 2) + "-" + align(this.month + 1, 2) + "-" + align(this.year, 4) + " " + align(this.hour, 2) + ":" + align(this.minute, 2) + ":" + align(this.second, 2);
}

/**
 * Разность дат в виде массива
 */
BigDate.prototype.diff = function (date) {
    var res = [];
    res.push(this.year - date.year);
    res.push(this.month - date.month);
    res.push(this.day - date.day);
    res.push(this.hour - date.hour);
    res.push(this.minute - date.minute);
    res.push(this.second - date.second);

    return res;
}

/**
 * Проверка года на високосность
 */
BigDate.prototype.isLeapYear = function () {
    //return this.year % 4 == 0 ? (this.year % 100 == 0 ? ( this.year % 400 == 0 ? true: false) : true) : false;
    return (this.year % 4 == 0) && (this.year % 100 != 0 || this.year % 400 == 0);
}

/**
 * adds some years
 */
BigDate.prototype.add = function (amount) {
    var year = Math.floor(amount);
    amount = amount % 1;
    var month = (amount) * 12;

    var res = new BigDate(this.year, this.month + 1, this.day + 1, this.hour, this.minute, this.second);
    res.year += year;
    res.month += month;

    while (res.month < 0) {
        res.year -= 1;
        res.month += 12;
    }

    if (Math.abs(month) % 11 > 0) {
        res.year += Math.floor(res.month / 12);
        res.month = Math.floor(res.month % 12);
    }

    return res;
}