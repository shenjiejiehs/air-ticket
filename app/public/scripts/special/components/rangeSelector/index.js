/**
 * 一个范围选择器.
 * 自带简单样式，可自行覆盖
 */

const m = require('m-react');

require('./index.css');
module.exports = m.createComponent({
  defaultProps: {
    min: 1,
    max: 100,
    // from: 20,
    // to: 80,
    step: 1,

    onChange: ({ from, to }) => console.log({ from, to })
  },

  getInitialState() {
    return {
      left: 0,
      width: 1,
      from: {
        active: false,
        value: 0
      },
      to: {
        active: false,
        value: 0
      }
    };
  },

  $el: null,
  _updateRect: null,
  updateRect() {
    setTimeout(() => {
      const { left, width } = this.$el
        .querySelector('.rail')
        .getBoundingClientRect();
      this.setState({ left, width });
    }, 0);
  },

  componentWillMount() {
    this.setState({
      from: {
        active: false,
        value: this.props.from
      },
      to: {
        active: false,
        value: this.props.to
      }
    });
  },

  componentDidMount(el) {
    this.$el = el;

    this._updateRect = () => this.updateRect();
    window.addEventListener('resize', this._updateRect);

    this.updateRect();
  },

  componentWillUnmount(el) {
    window.removeEventListener('resize', this._updateRect);
  },

  onTouchStart(key, e) {
    this.setState(
      keyValue(
        key,
        Object.assign(this.state[key], {
          active: true
        })
      )
    );
    this._onTouchMove = e => this.onTouchMove(key, e);
    this._onTouchEnd = e => this.onTouchEnd(key, e);
    document.addEventListener('touchmove', this._onTouchMove);
    document.addEventListener('mousemove', this._onTouchMove);
    document.addEventListener('touchend', this._onTouchEnd);
    document.addEventListener('mouseup', this._onTouchEnd);
  },

  _onTouchMove: null,
  onTouchMove(key, e) {
    if (this.state[key].active) {
      e.preventDefault();
      e.stopPropagation();
      const { min, max, step, from, to } = this.props;
      const { left, width } = this.state;
      const x = pluckPosX(e);
      const lowerBound = key === 'from' ? min : from + step;
      const upperBound = key === 'from' ? to - step : max;
      const value = restrict(
        rescale(x, left, width, min, max - min),
        lowerBound,
        upperBound,
        step
      );
      this.setState(
        keyValue(
          key,
          Object.assign(this.state[key], {
            value
          })
        )
      );
    }
  },

  _onTouchEnd: null,
  onTouchEnd(key, e) {
    this.setState(
      keyValue(
        key,
        Object.assign(this.state[key], {
          active: false
        })
      )
    );
    const value = this.state[key].value;
    if (value !== this.props[key]) {
      const { from, to } = this.state;
      const update = {
        from: from.value,
        to: to.value
      };
      this.props.onChange(update);
    }
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('mousemove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);
    document.removeEventListener('mouseup', this._onTouchEnd);
  },

  render({ min, max, step }, state) {
    return m('#range-selector.hl-text-22', [
      m('.rail'),
      ['from', 'to'].map(key => {
        const { left, width } = state;
        const { active, value } = state[key];
        return m(
          '.slider-wrapper.fx-col.fx-c-center' + (active ? '.active' : ''),
          {
            style: {
              transform: `translateX(${rescale(
                value,
                min,
                max - min,
                left,
                width
              ) - left}px)`,
              webkitTransform: `translate3d(${rescale(
                value,
                min,
                max - min,
                left,
                width
              ) - left}px, 0, 0)`
            }
          },
          [
            m('.indicator.fx-center', value),
            m(
              '.slider.fx-center',
              {
                ontouchstart: e => this.onTouchStart(key, e),
                onmousedown: e => this.onTouchStart(key, e)
              },
              value
            )
          ]
        );
      })
    ]);
  }
});

function rescale(valA, startA, lengthA, startB, lengthB) {
  return startB + (valA - startA) / lengthA * lengthB;
}

function restrict(val, min, max, step) {
  return Math.max(
    ceil(min, step),
    Math.min(floor(max, step), round(val, step))
  );
}

function round(val, step) {
  return val % step < step / 2 ? floor(val, step) : ceil(val, step);
}

function ceil(val, step) {
  return val % step ? floor(val, step) + 1 : val;
}

function floor(val, step) {
  return val - val % step;
}

function pluckPosX(e) {
  if (e.touches) {
    return e.touches[0].clientX;
  } else {
    return e.clientX;
  }
}

function keyValue(key, value) {
  let o = {};
  o[key] = value;
  return o;
}
