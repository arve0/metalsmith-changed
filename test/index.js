var Metalsmith = require('metalsmith');
var changed = require('../index.js');


var metalsmith = Metalsmith(__dirname)
  .clean(false)
  .use(changed())
  .build(function(err){
      if (err) throw err;
      console.log('done');
  });
