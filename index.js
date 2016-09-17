'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('metalsmith-changed');
var mm = require('micromatch');
var DEFAULTS = {
  force: false,
  forcePattern: false,
  forceAllPattern: false,
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
    return pattern === false || !mm.any(filename, pattern);
  };

  return function changed(files, metalsmith, done) {
    // files are already read => safe to write current ctimes
    files[opts.ctimes] = createCtimes(files);
    if (metalsmith.clean() || opts.force || contains(files, opts.forceAllPattern)) {
      debug('building all files');
    } else {
      var prevCtimes = readCtimes(metalsmith.destination(), opts.ctimes);
      var filenames = Object.keys(files).filter(notForced);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = filenames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var f = _step.value;

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
    }
    done();
  };
};

function hasCtime(file) {
  return file.stats && file.stats.ctime;
}

/**
 * Create a ctimes object of files.
 *
 * @param files {object}
 * @returns {object} Ctimes, { filename: Date.getTime(), ... }
 */
function createCtimes(files) {
  var ctimes = {}; // { 'index.md': 1464763631540, ... }
  var filenames = Object.keys(files);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = filenames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var f = _step2.value;

      if (!hasCtime(files[f])) {
        continue;
      }
      var ctime = files[f].stats.ctime.getTime();
      debug('ctime ' + f + ': ' + ctime);
      ctimes[f] = ctime;
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

  return { contents: JSON.stringify(ctimes, null, 2) };
}

/**
 * Get ctimes from filename.
 *
 * @param folder {string} Path to destination folder.
 * @param filename {string} Filename.
 * @returns {object} Ctimes object.
 */
function readCtimes(folder, filename) {
  try {
    var content = fs.readFileSync(path.join(folder, filename), 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}

/**
 * Returns true if some of the files matches the pattern.
 */
function contains(files, pattern) {
  return mm(Object.keys(files), pattern).length !== 0;
}
