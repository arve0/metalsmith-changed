var p = require('path');
var fs = require('fs');


/**
 * Only build files which have source file newer than the outfile.
 */

module.exports = function(options){
  options = options || {};
  var force = options.force || false;
  var extnames = options.extnames || {};


  return function drafts(files, metalsmith, done){
    if (force) {
      // do nothing
      return;
    }
    for (var file in files) {
      var extnameSrc = p.extname(file);
      var extnameDst = extnames[extnameSrc] || extnameSrc;
      var fileDst = p.join(p.dirname(file), p.basename(file, extname) + extnameOut);
      var statSrc = fs.statSync(file);
      var statDst = fs.statSync(fileDst);
      if (statDst.ctime.getTime() >= statSrc.ctime.getTime()) {
        delete files[file];
      }
    }
    done();
  };
}
