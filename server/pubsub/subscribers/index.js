let filesArray = new Array();

require('fs')
  .readdirSync(__dirname + '/')
  .forEach((file) => {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
      filesArray.push(require('./' + file));
    }
  });

module.exports = { listeners: filesArray };
