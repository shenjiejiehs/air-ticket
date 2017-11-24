var extend = require('common/extend');
var qs = require('../queryString');
var ensurePreSlash = require('./utils').ensurePreSlash;
var decodeURLEncodedURIComponent = require('./utils').decodeURLEncodedURIComponent;
var G = require('./globals');
var historySession = require('./session');

function Context(path, state) {
  path = ensurePreSlash(path);
  var qsIdx, queryString,
    hashIdx = path.indexOf('#');

  if (hashIdx !== -1) {
    this.hash = decodeURLEncodedURIComponent(path.slice(hashIdx + 1));
    path = path.slice(0, hashIdx);
  }
  qsIdx = path.indexOf('?');
  if (qsIdx !== -1) {
    queryString = decodeURLEncodedURIComponent(path.slice(qsIdx + 1));
    this.query = qs.parse(queryString);
    path = path.slice(0, qsIdx);
  }

  this.pathname = decodeURLEncodedURIComponent(path);

  this.title = document.title;

  this.params = {}; //propagated later
  this.state = state || {};
  this.state.path = this.pathname + (this.query ? '?' + qs.build(this.query) : '') + (this.hash ? '#' + this.hash : '');
}

var proto = Context.prototype;

proto.canonicalPath = function() {
  var searchObj = {},
    searchStr;
  searchObj[G.pathKey] = '/' === this.pathname ? undefined : this.pathname;

  searchObj = extend({}, qs.parse(G.location.search.slice(1)), this.query, searchObj);
  searchStr = qs.build(searchObj);
  return G.location.pathname + (searchStr ? '?' + searchStr : '') + (this.hash ? '#' + this.hash : '');
};

proto.push = function(handleSession) {
  this._dispatched = true;
  if(false !== handleSession) G.len++;


  if (false !== handleSession && historySession.hasSession()) {
    this.sessionName = historySession.topSessionName();
    history.replaceState(this.state, this.title, this.canonicalPath());
    historySession.push(this);
    return;
  }

  history.pushState(this.state, this.title, this.canonicalPath());
};

proto.replace = function(handleSession) {
  this._dispatched = true;

  history.replaceState(this.state, this.title, this.canonicalPath());

  if (false !== handleSession && historySession.hasSession()) {
    this.sessionName = historySession.topSessionName();
    historySession.replace(this);
    return;
  }
};

proto.startSession = function(sessionName) {
  if (this._dispatched) {
    this.sessionName = sessionName;
    if (!historySession.hasSession()) {
      historySession.push(this);
    }
  }
};

proto.endSession = function(sessionName) {
  if(this._dispatched){
    historySession.end(sessionName);
  }
};

proto.stopBack = function(){
  this.push();
  G.backHandlingStates[this.state.path] = 'start';
  return this;
};

proto.resumeBack = function(){
  G.backHandlingStates[this.state.path] = 'handled';
  history.back();
  return this;
};
module.exports = Context;
