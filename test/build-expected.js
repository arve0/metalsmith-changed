var Metalsmith = require('metalsmith');
var changed = require('../');
var path = require('path');

var src = path.join(__dirname, 'fixtures');

Metalsmith(src)
  .clean(true)
  .use(changed())  // remove metalsmith-changed.json from build
  .destination('build')
  .build(function (err, files) {
    if (err) {
      console.log(err);
    }
  });

Metalsmith(src)
  .clean(true)
  .use(changed())  // remove metalsmith-changed.json from build
  .destination('expected')
  .build(function (err, files) {
    if (err) {
      console.log(err);
    }
  });

Metalsmith(src)
  .clean(true)
  .use(changed())  // remove metalsmith-changed.json from build
  .destination('expected-generated')
  .use(function (files) {
    files['asdf.md'] = {
      title: 'asdf',
      contents: '1234'
    };
    files['fdsa.md'] = {
      title: 'asdf',
      contents: '1234',
      stats: {
        ctime: new Date(1970, 1)
      }
    };
  })
  .build(function (err, files) {
    if (err) {
      console.log(err);
    }
  });
