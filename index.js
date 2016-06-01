'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('metalsmith-changed');
var mm = require('micromatch');
var DEFAULTS = {
  force: false,
  forcePattern: false,
  ctimes: 'metalsmith-changed-ctimes.json' // where to store ctimes
};

module.exports = function (opts) {
  opts = Object.assign({}, DEFAULTS, opts);
  debug('options: ' + JSON.stringify(opts));

  /**
   * Return true if filename does not match `opts.forcePattern`.
   */
  var notForced = function notForced(filename) {
    var pattern = opts.forcePattern;
    return pattern === false || !mm.isMatch(filename, pattern);
  };

  /**
   * Write ctimes to `filename`.
   *
   * @param files {object}
   * @param filename {string}
   */
  function createCtimes(files, filename) {
    // write ctimes to input folder
    var ctimes = {}; // { 'index.md': 1464763631540, ... }
    var filenames = Object.keys(files);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = filenames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var f = _step.value;

        if (!hasCtime(files[f])) {
          continue;
        }
        var ctime = files[f].stats.ctime.getTime();
        debug('ctime ' + f + ': ' + ctime);
        ctimes[f] = ctime;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    fs.writeFileSync(filename, JSON.stringify(ctimes, null, 2));
  }

  return function changed(files, metalsmith, done) {
    // files are already read => safe to write current ctimes
    createCtimes(files, path.join(metalsmith.source(), opts.ctimes));
    if (metalsmith.clean() || opts.force || !files[opts.ctimes]) {
      debug('building all files');
    } else {
      var prevCtimes = JSON.parse(files[opts.ctimes].contents.toString());
      var filenames = Object.keys(files).filter(notForced);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = filenames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var f = _step2.value;

          if (!hasCtime(files[f])) {
            debug(f + ' does not have ctime');
            continue;
          }
          // file has not changed
          if (prevCtimes[f] && files[f].stats.ctime.getTime() === prevCtimes[f]) {
            debug('skipping ' + f);
            delete files[f];
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
    // remove opts.ctimes from the build
    delete files[opts.ctimes];
    done();
  };
};

function hasCtime(file) {
  return file.stats && file.stats.ctime;
}
