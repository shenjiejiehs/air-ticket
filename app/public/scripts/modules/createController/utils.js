function resolveKeys(resolver, o){
  return Object.keys(o).reduce(function(m, k){
    var v = o[k];
    m[resolver(k)] = v;
  } ,{});
}

module.exports = {
  resolveKeys: resolveKeys
};
