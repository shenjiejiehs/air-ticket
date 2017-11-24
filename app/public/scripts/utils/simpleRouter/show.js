const m = require('m-react');

module.exports = function show({
  page,
  fetchData,
  preload,
  preloadNext,
  rememberScrollTop = true
}) {
  if (typeof page !== 'string')
    throw new Error('page should be module path, instead of', page);

  if (preload) {
    preloadPage(page);
  }

  return { beforeEnter, afterEnter, beforeLeave };

  function beforeEnter({ route, ctx, passive }) {
    return Promise.resolve().then(() => {
      const shouldFetchData = fetchData && (!passive || !route.fetched);
      if (shouldFetchData) {
        return Promise.resolve(fetchData(route && route.query)).then(
          () => route.fetched = true
        );
      }
    });
  }

  function afterEnter({ route, ctx, passive }) {
    ctx.root =
      ctx.root || document.body.appendChild(document.createElement('div'));

    return Promise.resolve()
      .then(() => requireAsync(page))
      .then(component => m.mount(ctx.root, component))
      .then(
        () => rememberScrollTop && restoreScrollTop({ route, ctx, passive })
      )
      .then(() => {
        if (preloadNext) {
          preloadNext.forEach(preloadPage);
        }
      });
  }

  function beforeLeave({ route, ctx, passive }) {
    return Promise.resolve().then(
      () => rememberScrollTop && saveScrollTop({ route, ctx, passive })
    );
  }
};

function preloadPage(page) {
  setTimeout(function() {
    requireAsync(page);
  }, 500);
}

function saveScrollTop({ route, ctx }) {
  ctx.scrollElem = ctx.scrollElem || document.scrollingElement || document.body;
  if (route) route.scrollTop = ctx.scrollElem.scrollTop;
}

function restoreScrollTop({ route, ctx, passive }) {
  window.setTimeout(function() {
    ctx.scrollElem =
      ctx.scrollElem || document.scrollingElement || document.body;
    ctx.scrollElem.scrollTop = passive && route && route.scrollTop
      ? route.scrollTop
      : 0;
  }, 150);
}
