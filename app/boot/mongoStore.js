var MongoDBStore;

module.exports = {
  get: function(opts, session){
    if(!this.store) {
      MongoDBStore = require('connect-mongo')(session);
      this.store = new MongoDBStore(opts);
      this.store.on('error', function(err){
        console.error('Mongo DB store error: ', err);
      });
    }
    return this.store;
  },
  destroy: function(){
    if(this.store){
      this.store.db.close();
      this.store = null;
    }
  }
};
