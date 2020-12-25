"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekNumber = exports.getSpecificDay = exports.getDayAfter = exports.getDayBefore = exports.isSameDay = exports.getDaysBetween = exports.isAfter = exports.isBefore = void 0;
exports.isBefore = (dateA, dateB) => dateA < dateB;
exports.isAfter = (dateA, dateB) => dateA > dateB;
exports.getDaysBetween = (dateInitial, dateFinal) => (dateFinal - dateInitial) / (1000 * 3600 * 24);
exports.isSameDay = (dateA, dateB) => {
    if (dateA.getFullYear() !== dateB.getFullYear())
        return false;
    if (dateA.getMonth() !== dateB.getMonth())
        return false;
    if (dateA.getDate() !== dateB.getDate())
        return false;
    return true;
};
exports.getDayBefore = (date) => {
    const prevDate = new Date(date.getTime());
    prevDate.setDate(date.getDate() - 1);
    return prevDate;
};
exports.getDayAfter = (date) => {
    const nextDate = new Date(date.getTime());
    nextDate.setDate(date.getDate() + 1);
    return nextDate;
};
exports.getSpecificDay = (differenceInDays, hours, minutes, month) => {
    const specificDate = new Date();
    specificDate.setDate(specificDate.getDate() + differenceInDays);
    if (hours)
        specificDate.setHours(hours);
    if (minutes)
        specificDate.setMinutes(minutes);
    if (month)
        specificDate.setMonth(month);
    specificDate.setSeconds(0);
    specificDate.setMilliseconds(0);
    return specificDate;
};
exports.getWeekNumber = (date) => {
    // Copy date so don't modify original
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    // Return array of year and week number
    return [date.getUTCFullYear(), weekNo];
};
