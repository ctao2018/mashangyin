const content = require('./lzxinvoiceManagement.ejs');
const botSource = require('../../plugin/lzxinvoiceManagement.ejs');
const layout = require('../../template/layout.js');
const pf = {
  pageTitle: '发票审核管理',
  rtBtn1: 'right-search',
  rtStr1: '搜索'
}

module.exports = layout.init({
  pf
}).run(content(),'',botSource());