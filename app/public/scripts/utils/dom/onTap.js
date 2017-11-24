function onTap(el, handler){
  el._touchData = {};
  function ontouchstart(e){
    var point = e.touches[0];
    var touchData = el._touchData;
    touchData.startTime = e.timeStamp;
    touchData.startX = point.pageX;
    touchData.startY = point.pageY;
    // console.log(e);
    el.addEventListener('touchend', ontouchend, false);
  }

  function ontouchend(e){
    // console.log(e);
    var point = e.changedTouches[0];
    var touchData = el._touchData;
    var isTapped = (e.timeStamp - touchData.startTime < 200) && (Math.abs(point.pageX - touchData.startX) < 5) && (Math.abs(point.pageY - touchData.startY) < 5);

    if(isTapped && typeof handler === 'function'){
      handler(e);
    }
    // el.removeEventListener('touchstart', ontouchstart, false);
    el.removeEventListener('touchend', ontouchend, false);
  }

  el.addEventListener('touchstart', ontouchstart, false);

  return function clearHandlers(){
    el.removeEventListener('touchstart', ontouchstart, false);
  };
}

module.exports = onTap;
