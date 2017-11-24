module.exports = {
  pathKey: window.__qsKeyForRouter__ || '_p',
  callbacks: [],
  onBackCallbacks: [],
  exits: [],
  backHandlingStates: Object.create(null),
  currentContext: null,
  prevContext: null,
  len: 0,
  dispatch: true,
  decodeURIComponent: true,
  running: null,
  location: ('undefined' !== window) && (window.history.location || window.location)
};
