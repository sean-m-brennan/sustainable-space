/********************/
// Extensions to Date

import {replacer} from "./extJson"

export {};

declare global {
    interface Date{
        toUTC: () => Date;
        setToUTC: () => Date;
        setFromUTC: () => Date;
        toStringAsUTC: () => string;
        getDifference: (d: Date | string | number) => number;
        getDaysBetween: (d: Date) => number;
        getFracDayOfYear: () => number;
        getDayOfYear: () => number;
        getSecondsOfDay: () => number;
    }
}

Date.prototype.toJSON = function(key) {  // uses extJson
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return replacer(key, this)
}

Date.prototype.toUTC = function () {
    return new Date(this.getUTCFullYear(), this.getUTCMonth(),
        this.getUTCDate(), this.getUTCHours(),
        this.getUTCMinutes(), this.getUTCSeconds(),
        this.getUTCMilliseconds());
};

Date.prototype.setToUTC = function () {
    return new Date(this.getTime() +
        (this.getTimezoneOffset() * 60 * 1000));
};

Date.prototype.setFromUTC = function () {
    return new Date(this.getTime() -
        (this.getTimezoneOffset() * 60 * 1000));
};


Date.prototype.toStringAsUTC = function () {
    const str = this.toString();
    const idx = str.lastIndexOf("GMT");
    return str.substring(0, idx) + "GMT";
}

Date.prototype.getDifference = function (dt?: Date | string | number): number {
    let d;
    if (dt === undefined || dt === null) {
        d = new Date();
    } else if (dt instanceof Date) {
        d = dt;
    } else {
        d = new Date(dt);
    }
    return d.toUTC().getTime() - this.toUTC().getTime();
};

Date.prototype.getDaysBetween = function (d: Date | string | number): number {
    return Math.abs(this.getDifference(d)) / (24 * 60 * 60.0 * 1000.0);
};

Date.prototype.getFracDayOfYear = function () {
    return this.getDaysBetween(new Date(this.getFullYear(), 0, 0));
};

Date.prototype.getDayOfYear = function () {
    return parseInt(this.getFracDayOfYear().toString(), 10);
};


Date.prototype.getSecondsOfDay = function () {
    const d = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    return Math.abs(this.getDifference(d)) / 1000.0;
};
