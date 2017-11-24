var createSignal = require('modules/createSignal');

var signal = createSignal();

var sigHandlers = [
  require('./route'),
  require('./preload')
];

sigHandlers.forEach(function(register){
  register(signal);
});

module.exports = signal;
