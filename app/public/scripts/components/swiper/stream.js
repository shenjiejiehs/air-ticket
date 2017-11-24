function throttle(fn, delay) {
  if (delay) {
    let timer;
    return function timerThrottled(...args) {
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn(...args);
      }, delay);
    };
  } else {
    let request;
    return function rafThrottled(...args) {
      cancelAnimationFrame(request);
      request = requestAnimationFrame(function() {
        fn(...args);
      });
    };
  }
}

// a naive (and incorrect) implementation of observable

function easeOutQuad(t) {
  return t * (2 - t);
}

const streamProto = {
  subscribe(cb, emitOnSubscribe = true) {
    if (emitOnSubscribe && this.value !== undefined) {
      cb(this.value);
    }
    this.listeners.push(cb);
    return this;
  },
  unique() {
    let lastValue = this.value;
    let $unique = Stream(lastValue);
    this.subscribe(val => {
      if (val !== lastValue) {
        $unique(val);
        lastValue = val;
      }
    });
    return $unique;
  },
  map(f) {
    return Stream.combine(this, f);
  },
  filter(f) {
    return this.map(output => (f(output) ? output : undefined));
  },
  throttle(delay) {
    let $throttled = Stream(this.value);
    const emit = throttle(value => $throttled(value), delay);
    this.subscribe(emit);
    return $throttled;
  },
  flatten() {
    let $flattened = Stream();
    let activeStream = null;
    this.subscribe(stream => {
      if (typeof stream === 'function') {
        activeStream = stream;
        stream.subscribe(val => {
          if (stream === activeStream) {
            $flattened(val);
          }
        });
      }
    });
    return $flattened;
  }
};

function Stream(initial) {
  let s = function(val) {
    if (val !== undefined) {
      s.value = val;
      s.listeners.forEach(l => l(s.value));
    }
    return s.value;
  };

  s.value = initial;
  s.listeners = [];

  Object.assign(s, streamProto);

  return s;
}

Stream.combine = function(...streams) {
  let reducer = streams.pop();
  let cached = streams.map(s => s());
  let $combined = cached.some(val => val === undefined)
    ? Stream()
    : Stream(reducer(...cached));
  streams.forEach((stream, i) => {
    stream.subscribe(val => {
      cached[i] = val;
      $combined(reducer(...cached));
    }, false);
  });
  return $combined;
};

Stream.interval = function(int) {
  let $interval = Stream();
  let timer = setInterval(() => $interval(null), int);
  const remove = function() {
    clearInterval(timer);
  };
  return {
    stream: $interval,
    remove
  };
};

Stream.fromEvent = function(elem, type) {
  let $event = Stream();
  elem.addEventListener(type, $event);
  const remove = function() {
    if (elem) {
      elem.removeEventListener(type, $event);
    }
  };
  return { stream: $event, remove };
};

Stream.tween = function({
  start,
  end,
  duration = 300,
  easingFn = easeOutQuad
}) {
  let $tween = Stream(start);
  let startTime;
  let timeElapsed;
  let progress;
  function loop(timestamp) {
    if (!startTime) startTime = timestamp;
    timeElapsed = timestamp - startTime;
    progress = easingFn(timeElapsed / duration);
    if (timeElapsed < duration) {
      $tween(start + (end - start) * progress);
      requestAnimationFrame(loop);
    } else {
      $tween(end);
    }
  }
  requestAnimationFrame(loop);
  return $tween;
};

Stream.switchLatest = function(...streams) {
  const $latest = Stream();
  streams.forEach(stream =>
    stream.subscribe(val => {
      $latest(val);
    })
  );
  return $latest;
};

module.exports = Stream;
