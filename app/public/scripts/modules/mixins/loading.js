var slice = require('common/slice');
var type = require('common/type');
var Loading = require('components/loading');

//mixin - handle loading
//handleLoading: ([Tuple]...)->void
//each argument should be a array of tow or three items,
//like [status, 'Loading data...'](status == 'loading', then show loading)
//or [status, 'logging', 'Logging user...'](status == 'logging', then show loading)
module.exports = {
  handleLoading: function(){
    var status = slice(arguments).filter(type.isArray);
    var i = 0,
      l = status.length,
      item, loadingStatus, loadingLabel, isShowLoading;
    for(; i < l; i++){
      item = status[i];
      if(item.length > 2){
        loadingLabel = item[2];
        loadingStatus = item[1];
      }else{
        loadingLabel = item[1];
        loadingStatus = 'loading';
      }
      isShowLoading = typeof loadingStatus === 'function' ? !!loadingStatus(item[0]) : item[0] === loadingStatus;
      if(isShowLoading){
        Loading.showLoading(loadingLabel || '');
        return;
      }
    }

    Loading.hideLoading();
  },
  componentWillDetached: function(){
    Loading.hideLoading();
  }
};
  

