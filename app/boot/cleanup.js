var mongoStore = require('./mongoStore');

module.exports = cleanup;

function cleanup(/*app*/){
  console.log('\nPerforming cleanup before process exit!');
  console.log('\nDisconnect Mongo DB!');
  mongoStore.destroy();
}
