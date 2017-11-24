module.exports = (...fns) => arg => fns.reverse().reduce((prev, cur) => cur(prev), arg);
