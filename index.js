var p = require('path');
var fs = require('fs');
var debug = require('debug')('metalsmith-changed');
var mm = require('micromatch');


/**
 * Only build if dest file is older then src file.
 */

module.exports = function(options){
  options = options || {};
  var force = options.force || false;
  var extnames = options.extnames || {};
  var forcePattern = options.forcePattern || '';  // empty string will not match any file


  return function(files, metalsmith, done){
    setImmediate(done); // call done when call stack is empty
    var srcDir = p.join(metalsmith._directory, metalsmith._source);
    var dstDir = p.join(metalsmith._directory, metalsmith._destination);
    if (force) {
      // do nothing
      debug('force: true, building all files');
      return;
    }

    var statSrc, statDst;
    Object.keys(files).forEach(function(file){ // async
      if (mm.any(file, forcePattern)) {
        debug('building %s', file);
        return;
      }
      var extnameSrc = p.extname(file);
      var extnameDst = extnames[extnameSrc] || extnameSrc;
      var fileSrc = p.join(srcDir, file);
      var fileDst = p.join(dstDir, p.dirname(file), p.basename(file, extnameSrc) + extnameDst);
      try {
        statSrc = fs.statSync(fileSrc);
        statDst = fs.statSync(fileDst);
      } catch (e) {
        // dst file does not exist
        debug(e);
        return;
      }

      if (statDst.ctime.getTime() >= statSrc.ctime.getTime()) {
        // dst file is newer than src file
        delete files[file];
        return;
      }
      debug('building %s', file);
    });
  };
};
