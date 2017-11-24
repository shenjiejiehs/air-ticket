function type(thing) {
  return /^\[object (\w+)\]$/.exec(({}).toString.call(thing))[1].toLowerCase();
}

module.exports = type;
