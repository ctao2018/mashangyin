const content = require('./ccGenerateLetter.ejs');

const layout = require('../../template/layout.js');
const pf = {
  pageTitle: '委托函',
}


module.exports = layout.init({
  pf
}).run(content({}),'',);