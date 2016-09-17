const fs = require('fs');
const path = require('path');
const debug = require('debug')('metalsmith-changed');
const mm = require('micromatch');
const DEFAULTS = {
  force: false,
  forcePattern: false,
  forceAllPattern: false,
  ctimes: 'metalsmith-changed-ctimes.json'  // where to store ctimes
};

module.exports = function (opts) {
  opts = Object.assign({}, DEFAULTS, opts);
  debug(`options: ${JSON.stringify(opts)}`);

  /**
   * Return true if filename does not match `opts.forcePattern`.
   */
  const notForced = function (filename) {
    const pattern = opts.forcePattern;
    return pattern === false || !mm.any(filename, pattern);
  };

  return function changed (files, metalsmith, done) {
    // files are already read => safe to write current ctimes
    files[opts.ctimes] = createCtimes(files);
    if (metalsmith.clean() || opts.force ||
        contains(files, opts.forceAllPattern)) {
      debug('building all files');
    } else {
      const prevCtimes = readCtimes(metalsmith.destination(), opts.ctimes);
      const filenames = Object.keys(files).filter(notForced);
      for (let f of filenames) {
        if (!hasCtime(files[f])) {
          debug(`${f} does not have ctime`);
          continue;
        }
        // file has not changed
        if (prevCtimes[f] && files[f].stats.ctime.getTime() === prevCtimes[f]) {
          debug(`skipping ${f}`);
          delete files[f];
        }
      }
    }
    done();
  };
};

function hasCtime (file) {
  return file.stats && file.stats.ctime;
}

/**
 * Create a ctimes object of files.
 *
 * @param files {object}
 * @returns {object} Ctimes, { filename: Date.getTime(), ... }
 */
function createCtimes (files) {
  let ctimes = {};  // { 'index.md': 1464763631540, ... }
  let filenames = Object.keys(files);
  for (let f of filenames) {
    if (!hasCtime(files[f])) {
      continue;
    }
    let ctime = files[f].stats.ctime.getTime();
    debug(`ctime ${f}: ${ctime}`);
    ctimes[f] = ctime;
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
function readCtimes (folder, filename) {
  try {
    let content = fs.readFileSync(path.join(folder, filename), 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}

/**
 * Returns true if some of the files matches the pattern.
 */
function contains (files, pattern) {
  return mm(Object.keys(files), pattern).length !== 0;
}
