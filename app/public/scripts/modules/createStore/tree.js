const valByKeypath = require('common/l/valByKeypath');
const type = require('common/type');
const HANDLER_PROPERTY_NAME = '__$$handlers&&__';

// @ifdef DEBUG
const assert = require('common/assert');
// @endif

module.exports = {
  addHandlerToTree: addHandlerToTree,
  rmHandlerFromTree: rmHandlerFromTree,
  addUpdateToTree: addUpdateToTree,
  getHandlers: getHandlers,
  print: function(tag, tree){
    printTree(tag, tree, 0);
  }
};

function addHandlerToTree(path, handler, tree){
  // @ifdef DEBUG
  assert(type(path) === 'string', 'path should be a string!', TypeError);
  assert(type(tree) === 'object', 'tree should be an object!', TypeError);
  // @endif
  var handlerKpath = path.trim().length === 0 ?
    HANDLER_PROPERTY_NAME :
    (path + '.' + HANDLER_PROPERTY_NAME);
  valByKeypath(handlerKpath, tree, handler, _addHandler);
  return tree;
}

function rmHandlerFromTree(handler, tree){
  if(!type.isObject(tree)){
    _removeHandler(tree, handler);
  }else{
    Object.keys(tree).forEach(function(k){
      rmHandlerFromTree(handler, tree[k]);
    });
  }
}

function addUpdateToTree(path, tree){
   // @ifdef DEBUG
  assert(type(path) === 'string', 'path should be a string!', TypeError);
  assert(type(tree) === 'object', 'tree should be an object!', TypeError);
  // @endif
  path = path.trim();
  if(path.length === 0) return {};
  var paths = path.split('.'),
    i = 0, o = tree,
    p, _o;
  while(i < paths.length - 1){
    p = paths[i];
    _o = o[p];
    if(Object(_o) !== _o){
      if(_o === 1){
        return tree;
      } else {
        o[p] = {};
      }
    }
    o = o[p];
    i++;
  }
  o[paths[i]] = 1;
  return tree;
}

function _getHandlersByTree(tree, result){
  if(!type.isObject(tree)){
    return;
  }
  var handlers = tree[HANDLER_PROPERTY_NAME];
  mergeHandlers(result, handlers);

  Object.keys(tree).forEach(function(k){
    _getHandlersByTree(tree[k], result);
  });
  return result;
}

function _getHandlersByUpdate(updateTree, tree, result){
  if(!type.isObject(tree)){
    return;
  }
  if(updateTree === 1){
    _getHandlersByTree(tree, result);
    return;
  }
  var handlers = tree[HANDLER_PROPERTY_NAME];
  mergeHandlers(result, handlers);

  Object.keys(updateTree).forEach(function(k){
    _getHandlersByUpdate(updateTree[k], tree[k], result);
  });
  return result;
}

function getHandlers(updates, handlersRegistry){
  var handlers = [];
  if(!type.isObject(updates) || Object.keys(updates).length === 0){
    _getHandlersByTree(handlersRegistry, handlers);
  }else{
    _getHandlersByUpdate(updates, handlersRegistry, handlers);
  }

  return handlers;
}
//helpers
function _addHandler(list, handler){
  list = type.isArray(list)? list : [];
  if(list.indexOf(handler) === -1){
    list.push(handler);
  }
  return list;
}

function _removeHandler(list, handler){
  if(!type.isArray(list) || list.length === 0){
    return;
  }
  var idx = list.indexOf(handler);
  if(idx !== -1){
    list.splice(idx, 1);
  }
  return list;
}

function mergeHandlers(target, input){
  if(!input){
    return;
  }
  var i = 0, l = input.length, handler;
  for(; i < l ; i++){
    handler = input[i];
    if(target.indexOf(handler) === -1){
      target.push(handler);
    }
  }
}

function printTree(tag, tree, indent){
  var space = '';
  var i = indent;
  while(i > 0){
    space += ' ';
    i -= 1;
  }
  if(!type.isObject(tree)){
    console.log(space + '<' +tag + '>:' + _toPrtStr(tree));
  }else{
    console.log(space + '<' +tag + '>-');
    Object.keys(tree).forEach(function(k){
      printTree(k, tree[k], indent + 4);
    });
  }
}
function _toPrtStr(o){
  if(Array.isArray(o)){
    return '[' + o.map(_toPrtStr).join(',')+ ']';
  }
  return o._tag ? o._tag : '' + o;
}
