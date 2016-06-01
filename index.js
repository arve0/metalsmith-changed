const fs = require('fs');
const path = require('path');
const debug = require('debug')('metalsmith-changed');
const mm = require('micromatch');
const DEFAULTS = {
  force: false,
  forcePattern: false,
  ctimes: 'metalsmith-changed-ctimes.json' // where to store ctimes
};

module.exports = function (opts) {
  opts = Object.assign({}, DEFAULTS, opts);
  debug(`options: ${ JSON.stringify(opts) }`);

  /**
   * Return true if filename does not match `opts.forcePattern`.
   */
  const notForced = function (filename) {
    const pattern = opts.forcePattern;
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
    let ctimes = {}; // { 'index.md': 1464763631540, ... }
    let filenames = Object.keys(files);
    for (let f of filenames) {
      if (!hasCtime(files[f])) {
        continue;
      }
      let ctime = files[f].stats.ctime.getTime();
      debug(`ctime ${ f }: ${ ctime }`);
      ctimes[f] = ctime;
    }
    fs.writeFileSync(filename, JSON.stringify(ctimes, null, 2));
  }

  return function changed(files, metalsmith, done) {
    // files are already read => safe to write current ctimes
    createCtimes(files, path.join(metalsmith.source(), opts.ctimes));
    if (metalsmith.clean() || opts.force || !files[opts.ctimes]) {
      debug('building all files');
    } else {
      const prevCtimes = JSON.parse(files[opts.ctimes].contents.toString());
      const filenames = Object.keys(files).filter(notForced);
      for (let f of filenames) {
        if (!hasCtime(files[f])) {
          debug(`${ f } does not have ctime`);
          continue;
        }
        // file has not changed
        if (prevCtimes[f] && files[f].stats.ctime.getTime() === prevCtimes[f]) {
          debug(`skipping ${ f }`);
          delete files[f];
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
