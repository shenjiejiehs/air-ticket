var m = require('m-react');
var Header = require('components/header');
var Swiper = require('./index');

require('./spec.css');
module.exports = m.createComponent({
  title: '组件测试：Slider',
  getInitialState() {
    return {
      slides: [
        // m('.card', { key: 1, onclick: console.log }, 1),
        // m('.card', { key: 2 }, 2),
        // m('.card', { key: 3 }, 3),
        // m('.card', { key: 4 }, 4)
      ],
      autoPlay: false,
      autoPlayInterval: 1000
    };
  },
  componentDidMount(el) {
    setTimeout(
      () => {
        this.setState({
          slides: [
            m('.card', { key: 1, onclick: console.log }, 1),
            m('.card', { key: 2 }, 2),
            m('.card', { key: 3 }, 3),
            m('.card', { key: 4 }, 4)
          ]
        });
      },
      1000
    );
    setTimeout(
      () => {
        this.setState({
          slides: [
            m('.card', { key: 1, onclick: console.log }, 1),
            m('.card', { key: 2 }, 2),
            m('.card', { key: 3 }, 3),
            m('.card', { key: 4 }, 4)
          ],
          autoPlay: true,
          autoPlayInterval: 1000
        });
      },
      1500
    );
    setTimeout(
      () => {
        this.setState({
          slides: [
            m('.card', { key: 1, onclick: console.log }, 1),
            m('.card', { key: 4 }, 4),
            m('.card', { key: 5 }, 5)
          ]
        });
      },
      4000
    );
    setTimeout(
      () => {
        this.setState({
          autoPlay: false,
          autoPlayInterval: 500
        });
      },
      6000
    );
    setTimeout(
      () => {
        this.setState({
          autoPlay: true
        });
      },
      8000
    );
  },
  render: function(props, state) {
    return m('.special-home', [
      m(Header, { title: this.title }),
      m(Swiper, {
        slides: state.slides,
        autoPlay: state.autoPlay,
        autoPlayInterval: state.autoPlayInterval
      }),
      m('', '当前输入'),
      m('pre', JSON.stringify(state, ' ', 2))
    ]);
  }
});
