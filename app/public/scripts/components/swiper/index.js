/**
 * 一个简单的Slider/Carousel组件
 *
 * 支持：
 * - 自己用CSS指定容器和页面的大小和样式
 * - 自动换页
 * - 动态更新页面内容
 * - 页面指示器
 */

const m = require('m-react');
const Stream = require('./stream');

require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    slides: [], // vnode[], 要显示的页 (用vnode.key作为唯一性标记，如果key不变则视为slide没变), 注意：每次更改后第一次render会做一次尺寸测量，所以请保证布局不会跳动（比如加载图片造成的尺寸变动等）
    placeholder: m('.swiper-placeholder', { key: 'placeholder' }, '正在加载'), // string/vnode
    autoPlay: false, // boolean, 是否自动播放
    autoPlayInterval: 5000, // int, 自动播放间隔(in ms)
    indicator: true, // true | false | Function: ({length, curIndex}) => Vnode  当前页指示器
    onSlideChange: noop
  },

  $slides: null,
  $placeholder: null,
  autoPlay: null,
  autoPlayInterval: null,
  $indicator: null,
  removeEventListeners: null,
  removeAutoPlayTimer: null,

  componentDidMount(el) {
    const $slides = (this.$slides = Stream(this.props.slides));
    const $placeholder = (this.placeholder = Stream(this.props.placeholder));
    const $indicator = (this.indicator = Stream(this.props.indicator));
    const autoPlay = (this.autoPlay = Stream(this.props.autoPlay));
    const autoPlayInterval = (this.autoPlayInterval = Stream(
      this.props.autoPlayInterval
    ));
    const {
      stream: autoPlayPulse,
      remove: removeAutoPlayTimer
    } = getAutoPlayPulse(autoPlay, autoPlayInterval);
    this.removeAutoPlayTimer = removeAutoPlayTimer;

    const $el = Stream(el);

    const $slider = $el.map(el => el.querySelector('.swiper-slider'));
    $slider().style.webkitTransform = 'none';
    $slider().style.transform = 'none';

    const rerendered = Stream.combine(
      $placeholder,
      $slides,
      (placeholder, slides) => {
        m.render($slider(), slides.length ? slides : placeholder, false, true);
        return true;
      }
    );

    const $indicatorContainer = $el.map(el =>
      el.querySelector('.swiper-indicator')
    );

    const { userDrag, removeEventListeners } = getUserDrag($el());
    this.removeEventListeners = removeEventListeners;

    const offset = Stream(0);

    const offsets = rerendered.map(calcOffsets($el(), $slider(), offset));

    const curIndex = Stream.combine(offsets, offset, calcCurIndex).unique();

    const offsetAsDragStart = userDrag
      .map(drag => drag.isDragging)
      .unique()
      .filter(Boolean)
      .map(() => offset());

    const offsetByUser = userDrag
      .filter(drag => drag.isDragging)
      .map(drag => offsetAsDragStart() + drag.dragDistanceX);

    const operSilencePeriod = getOperSilence(userDrag);

    const targetIndexAfterDrag = Stream.combine(
      userDrag.filter(drag => !drag.isDragging),
      offsets,
      ({ dragVelocityX }, offsets) => {
        const targetOffset =
          offset() + dragVelocityX * Math.abs(dragVelocityX) * 50;
        let targetIndex = offsets
          .map((preset, i) => [i, Math.abs(preset - targetOffset)])
          .sort((a, b) => a[1] - b[1])[0][0];
        return Math.min(curIndex() + 1, Math.max(curIndex() - 1, targetIndex));
      }
    );

    const targetIndexByAutoPlay = autoPlayPulse
      .filter(() => !operSilencePeriod())
      .map(() => (curIndex() + 1) % offsets().length);

    const targetIndex = Stream.switchLatest(
      targetIndexAfterDrag,
      targetIndexByAutoPlay
    );
    setTimeout(function() {
      targetIndex(0);
    }, 0);

    const offsetAuto = Stream.combine(
      targetIndex,
      offsets,
      (index, offsets) => {
        const _offsets = offsets;
        const tween = Stream.tween({
          start: offset(),
          end: _offsets[Math.max(0, Math.min(_offsets.length - 1, index))]
        });
        return tween;
      }
    ).flatten();

    const newOffset = Stream.combine(
      userDrag,
      offsetByUser,
      offsetAuto,
      (drag, byUser, auto) => (drag.isDragging ? byUser : auto)
    );

    newOffset.subscribe(x => offset(x));

    offset.subscribe(updateSliderPos($slider));

    curIndex.subscribe(this.props.onSlideChange);

    Stream.combine(offsets, curIndex, (offsets, curIndex) => ({
      length: offsets.length,
      curIndex
    })).subscribe(renderIndicator($indicatorContainer, $indicator));
  },

  componentWillUnmount(el) {
    if (this.removeEventListeners) this.removeEventListeners();
    if (this.removeAutoPlayTimer) this.removeAutoPlayTimer();
  },

  shouldComponentUpdate({
    slides,
    placeholder,
    indicator,
    autoPlay,
    autoPlayInterval
  }) {
    if (
      slides.length !== this.props.slides.length ||
      slides.some(
        (_, i) => slides[i].attrs.key !== this.props.slides[i].attrs.key
      )
    ) {
      this.$slides(this.props.slides);
    }

    if (
      typeof this.props.indicator === 'boolean' &&
      this.props.indicator !== indicator
    ) {
      this.indicator(this.props.indicator);
    }

    if (this.props.autoPlay !== autoPlay) this.autoPlay(this.props.autoPlay);

    if (this.props.autoPlayInterval !== autoPlayInterval)
      this.autoPlayInterval(this.props.autoPlayInterval);

    return false;
  },

  render() {
    return m('#swiper.swiper', [
      m('#swiper-slider.swiper-slider'),
      m('#swiper-indicator.swiper-indicator')
    ]);
  }
});

function getAutoPlayPulse(autoPlay, autoPlayInterval) {
  let timer;
  const pulse = Stream();

  Stream.combine(autoPlay, autoPlayInterval, (play, interval) => {
    clearTimeout(timer);

    function trigger() {
      if (play) {
        pulse(true);
        timer = setTimeout(trigger, interval);
      }
    }
    timer = setTimeout(trigger, interval);
  });

  const remove = function() {
    clearTimeout(timer);
  };
  return { stream: pulse, remove };
}

function calcOffsets($el, $slider, offset) {
  return () => {
    const slides = [].slice.call($slider.children);
    const swiperRect = $el.getBoundingClientRect();
    const slideRects = slides.map(slide => slide.getBoundingClientRect());
    const center = rect => rect.left + rect.width / 2;
    const values = slideRects.map(
      slideRect => center(swiperRect) - (center(slideRect) - offset())
    );

    return values;
  };
}

function calcCurIndex(offsets, offset) {
  return offsets
    .map((preset, i) => [i, Math.abs(preset - offset)])
    .sort((a, b) => a[1] - b[1])[0][0];
}

function updateSliderPos($slider) {
  return offset => {
    $slider().style.webkitTransform = `translate3d(${offset}px, 0px, 0px)`;
    $slider().style.transform = `translate3d(${offset}px, 0px, 0px)`;
  };
}

function getUserDrag($elem) {
  const isDragging = Stream(false);
  const dragDistanceX = Stream(0);
  const dragVelocityX = Stream(0);

  let startX, startY, lastX, lastTime, isPossiblelyScroll = true;

  const { stream: touchStart, remove: removeTouchStart } = Stream.fromEvent(
    $elem,
    'touchstart'
  );
  const { stream: touchMove, remove: removeTouchMove } = Stream.fromEvent(
    $elem,
    'touchmove'
  );
  const { stream: touchEnd, remove: removeTouchEnd } = Stream.fromEvent(
    $elem,
    'touchend'
  );

  touchStart.subscribe(e => {
    const { x, y } = pluckTouchPos(e);
    startX = x;
    startY = y;
    lastX = x;
    lastTime = new Date().valueOf();
    isDragging(true);
    dragDistanceX(0);
    dragVelocityX(0);
  });

  touchMove.subscribe(e => {
    if (isDragging()) {
      const { x, y } = pluckTouchPos(e);
      const dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dx) > 10) isPossiblelyScroll = false;
      if (
        isPossiblelyScroll &&
        Math.abs(dx) < 10 &&
        Math.abs(dy) > Math.abs(dx)
      ) {
        isDragging(false);
      } else {
        e.preventDefault();
        const time = new Date().valueOf();
        dragDistanceX(x - startX);
        dragVelocityX((x - lastX) / (time - lastTime));
        lastX = x;
        lastTime = time;
      }
    }
  });

  touchEnd.subscribe(e => {
    if (isDragging()) isDragging(false);
  });

  const userDrag = Stream.combine(
    isDragging,
    dragDistanceX,
    dragVelocityX,
    (isDragging, dragDistanceX, dragVelocityX) => ({
      isDragging,
      dragDistanceX,
      dragVelocityX
    })
  );

  const removeEventListeners = function() {
    removeTouchStart();
    removeTouchMove();
    removeTouchEnd();
  };

  return { userDrag, removeEventListeners };
}

function getOperSilence(userDrag) {
  let timer;
  const silencePeriod = Stream(false);
  userDrag.map(drag => drag.isDragging).unique().subscribe(isDragging => {
    clearTimeout(timer);
    if (isDragging) {
      silencePeriod(true);
    } else {
      timer = setTimeout(function() {
        silencePeriod(false);
      }, 8000);
    }
  });
  return silencePeriod;
}

function pluckTouchPos(e) {
  return {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  };
}

function renderIndicator($indicatorContainer, $indicator) {
  const $indicatorAdapted = $indicator.map(ind => {
    if (ind === true) return DefaultIndicator;
    if (ind === false) return noop;
    return ind;
  });

  return options => {
    m.render($indicatorContainer(), $indicatorAdapted()(options), false, true);
  };
}

function DefaultIndicator({ length = 1, curIndex = 0 } = {}) {
  if (length <= 1) {
    return null;
  } else {
    return m(
      '.swiper-indicator-default.fx-row.fx-m-center.fx-c-end',
      arrayOf(length).map((_, i) =>
        m('.dot' + (i === curIndex ? '.active' : ''))
      )
    );
  }

  function arrayOf(length) {
    let arr = [];
    while (length--)
      arr.push(null);
    return arr;
  }
}

function noop() {}

function log(name, stream) {
  console.log('[stream]', name, stream.value);
  stream.subscribe(e => console.log('[stream]', name, e));
}
