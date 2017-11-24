module.exports = function(objA, objB, checkChildren){
  if(objA === objB){
    return true;
  }

  if(typeof objA !== 'object' || objA == null || typeof objB !== 'object' || objB == null){
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if(checkChildren){
    keysA = _removeItem(keysA, 'children');
    keysB = _removeItem(keysB, 'children');
  }

  if(keysA.length !== keysB.length){
    return false;
  }

  var bHasOwn = Object.prototype.hasOwnProperty.bind(objB);
  var key, i, l = keysA.length;
  for(i=0; i < l; i++){
    key = keysA[i];
    if(!bHasOwn(key) || objA[key] !== objB[key]){
      return false;
    }
  }

  if(checkChildren){
    if(!Array.isArray(objA.children) || !Array.isArray(objB.children)|| objA.children.length !== objB.children.length){
        return false;
      }
  }

  return true;
};

function _removeItem(arr, item){
  var idx = arr.indexOf(item);
  if(idx > -1){
    arr.splice(idx, 1);
  }
  return arr;
}
