const m = require('m-react');
const Header = require('components/header');
const Special = require('../../services/special');
const PromotePage = require('../../services/promotePage');
const redraw = require('../../../utils/hookRedraw');
const openInApp = require('../../../utils/openInApp');
const LocationQuery = require('../../../utils/simpleRouter/locationQuery');
const share = require('../../../utils/share');
const env = require('../../../utils/env');
const router = require('../../../utils/simpleRouter');

require('css/flex.css');
require('./index.css');

const Page = {
  title: '特价机票',

  onClickPic(pic) {
    return env().then(({ browser }) => {
      if (pic.org || pic.dst) {
        const from =
          { hbgj: 'special_hbgj', gtgj: 'special_gtgj' }[browser] ||
          'special_other';

        const opts = {
          type: 'ticketlist',
          scty: pic.org,
          ecty: pic.dst,
          fdate: pic.date,
          fben: pic.cabin,
          sp: JSON.stringify({ from })
        };

        if (pic.rdate) {
          opts.arrdate = pic.rdate;
        }

        return openInApp(opts);
      }
    });
  },

  render: function() {
    let { promote } = Special;
    let p = promote.datas;

    return m('#special-promote', [
      LocationQuery({ id: PromotePage.id }),
      m(Header, {
        title: p.title,
        headerRightBtn: Header.headerRightBtns.share,
        onHeaderRightBtnClick: share({
          title: p.title,
          desc: '',
          imgUrl:
            location.origin +
            router.resolve('scripts/special/components/share/share.png')
        })
      }),

      m('.container', [
        m('.title', p.title),
        m('.desc.hl-text-sm', `${p.publishdisplay} ${p.publisher || '航班管家'}`),
        m(
          '.article',
          p.contents.map(({ pics, texts, title }) =>
            m('.section', [
              m('.heading', title),
              m('.text.hl-text-sm', texts.map(t => m('p', t))),
              m(
                '.images',
                pics.map(pic =>
                  m('img', {
                    onclick: redraw(() => this.onClickPic(pic)),
                    src: pic.pic_url
                  })
                )
              )
            ])
          )
        ),
        m('.footer.hl-text-center', [m('.icon-cool'), m('span', p.footer)])
      ])
    ]);
  }
};

module.exports = m.createComponent(Page);
