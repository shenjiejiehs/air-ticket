var m = require('m-react');
var cx = require('utils/m/className');

require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    title: '',
    content: '',
    isCollapsed: true
  },

  getInitialState: function() {
    return {
      isCollapsed: this.props.isCollapsed
    };
  },

  onCollapse: function() {
    this.setState({
      isCollapsed: !this.state.isCollapsed
    });
  },

  render: function(props, state) {
    return m('.accordion.hl-list-group.hl-list-group-pl', [
      m('.hl-list-group-item', {
        evClick: this.onCollapse
      }, [
        m('span', props.title),
        m('span.accordion-icon', {
          class: cx({
            'collapsed': state.isCollapsed,
            'expanded': !state.isCollapsed
          })
        })
      ]),
      m('.hl-list-group-item.hl-text-sm.hl-text-gray', {
        class: cx({
          'hl-hide': state.isCollapsed,
          'hl-show': !state.isCollapsed
        })
      }, [
        m.trust(props.content)
      ])
    ])
  }
});