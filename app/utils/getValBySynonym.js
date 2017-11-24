var SYNONYMS = [
  ['dev', 'develop', 'development'],
  ['prod','product', 'production', 'deploy', 'deployment', 'dep'],
  ['test', 'debug']
];
function findSynonyms(s){
  var i = 0, l = SYNONYMS.length, result;
  for(;i < l; i++){
    if(SYNONYMS[i].indexOf(s) !== -1){
      result = SYNONYMS[i];
      break;
    }
  }
  return result;
}

function getValBySynonym (o, s) {
  var synonyms = findSynonyms(s), result, i, l;
  if(!synonyms){
    return hasOwn(o, s) ? o[s] : undefined;
  }
  for(i = 0, l = synonyms.length; i < l; i++){
    if(hasOwn(o, synonyms[i])){
      result = o[synonyms[i]];
      break;
    }
  }
  return result;
}
function hasOwn(o, k){
  return Object.prototype.hasOwnProperty.call(o, k);
}
module.exports = getValBySynonym;

