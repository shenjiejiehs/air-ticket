var observable = require('./observable');
var Promise = require('./promise');

function SwitchLatestPromise() {
  this.resolver = null;
  this.latestTask = observable(null);
  this.currentTask = null;
}

SwitchLatestPromise.prototype.handlePromise = function(promise, resolve, reject) {
  var self = this;

  if (promise === null) {
    self.currentTask = undefined;
    resolve = reject = null;
    return;
  }

  var curPromise = Promise.resolve(promise);

  self.currentTask = curPromise;
  curPromise.then(function(result) {
    if (self.currentTask === curPromise) {
      resolve(result);
    } else {
      resolve = null;
    }
  })['catch'](function(err) {
    if (self.currentTask === curPromise) {
      reject(err);
    } else {
      reject = null;
    }
  });
};

SwitchLatestPromise.prototype.getResolver = function() {
  var self = this;
  if (!self.resolver) {
    self.resolver = (new Promise(function(resolve, reject) {
      self.handlePromise(self.latestTask(), resolve, reject);
      self.latestTask.on(function(promise) {
        self.handlePromise(promise, resolve, reject);
      });
    })).then(function(result) {
      self.resolver = null;
      return result;
    })['catch'](function(err) {
      self.resolver = null;
      throw err;
    });

    self.resolver.done = function(onResult, onError) {
      if (this._done) {
        return;
      }
      this._done = true;
      this.then(onResult, onError);
    };
  }
  return self.resolver;
};

SwitchLatestPromise.prototype.addTask = function(promise) {
  this.latestTask(promise);
};

module.exports = SwitchLatestPromise;
