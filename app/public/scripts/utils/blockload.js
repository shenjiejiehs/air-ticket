/**
 * 通过添加一个假的样式链接，来推迟页面加载完成事件，使客户端能得到正确的页面高度
 *
 * window.blockLoad: 开始阻塞 （这个必须在页面加载的开始同步调用）
 * window.unblockLoad: 结束阻塞
 */

(function() {
  var link, interval;

  window.blockLoad = function() {
    console.warn('[blockload] start block!');
    link = document.createElement('link');
    link.id = 'pending';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = window.url_base + 'api/delay?delay=200';

    document.body.appendChild(link);
    interval = setTimeout(function() {
      link.href = window.url_base + 'api/delay?delay=200';
    }, 200);
    setTimeout(window.unblockLoad, 10000); //最多阻塞10秒？
  };

  window.unblockLoad = function() {
    if (!link || !interval) {
      console.warn('[blockload] not blocked, skip unblock');
      return;
    }
    clearInterval(interval);
    interval = null;
    link.href = window.url_base + 'api/delay';
    link.parentNode.removeChild(link);
    console.warn('[blockload] unblocked!');
  };

})();
