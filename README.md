[![npm version](https://badge.fury.io/js/metalsmith-changed.svg)](https://badge.fury.io/js/metalsmith-changed) [![Build Status](https://travis-ci.org/arve0/metalsmith-changed.svg?branch=master)](https://travis-ci.org/arve0/metalsmith-changed)

# metalsmith-changed
Only process files that have changed.

metalsmith-changed will write a ctimes json-file to your `src`-folder in order to keep track of changed files.

 **Must** be used with `metalsmith.clean(false)`, `.clean(true)` (the default) disables metalsmith-changed and all files are passed on to the next plugin.

 metalsmith-changed can also be disabled with `force: true` and individual files can be ignored (always build) with `forcePattern`.


## example
```js
var Metalsmith = require('metalsmith');
var changed = require('metalsmith-changed');

Metalsmith()
  .clean(false)
  .use(changed())
  ... // more plugins
  .build(function (err) {
    if (err) throw err;
  });
```

Which is useful when watching files and livereloading:
```js
const Metalsmith = require('metalsmith');
const changed = require('metalsmith-changed');
const livereload = require('metalsmith-livereload');
const nodeStatic = require('node-static');
const watch = require('glob-watcher');
const open = require('open');

const DIR = __dirname + '/test/fixtures/';

/**
 * Build with metalsmith.
 */
const build = (clean = false) => (done) => {
  console.log(`Building. clean: ${clean}.`);
  Metalsmith(DIR)
    .clean(clean)
    .use(changed())
//    .use(expensivePlugin())  // ie markdown -> html
    .use(livereload({ debug: true }))
    .build((err, files) => {
      let filenames = Object.keys(files).join(', ');
      console.log('Built: ' + filenames);
      done(err);
    });
};

/**
 * Serve files.
 */
var serve = new nodeStatic.Server(DIR + 'build');
require('http').createServer((req, res) => {
  req.addListener('end', () => serve.serve(req, res));
  req.resume();
}).listen(8080);

/**
 * Watch files.
 */
watch(DIR + 'src/**/*', { ignoreInitial: false }, build(false));
// watch(DIR + 'templates/**/*', build(true));  // force build of all files

/**
 * Open browser.
 */
open('http://localhost:8080');
```

As ctimes are persisted to disk, this works nice with cli tools like [watch run](https://www.npmjs.com/package/watch-run) too.

## forcePattern
If the option `forcePattern` is defined, files matching the pattern(s) will not
be removed from building even if the file has not changed. `forcePattern` should
be a string or an array of strings.

[micromatch](https://github.com/jonschlinkert/micromatch) is used for
matching the files.

Example:
```js
Metalsmith()
  .clean(false)
  .use(changed({
    forcePattern: [
      '**/index.md',  // always build index files
      ...             // more patterns
    ]
  }))
  ... // more plugins
  .build(function(err){
    if (err) throw err;
  });
```


## default options
```js
changed({
  force: false,  // build all files
  forcePattern: false  // always build files matching these patterns
})
```


## metalsmith-changed-ctimes.json
`metalsmith-changed-ctimes.json` is written to your `src` folder upon every build. `metalsmith-changed` takes ctimes from `files[n].stats.ctime`, so if a plugin creates files with `.stats.ctime`, `metalsmith-changed` can be used with it.

Files without `stats.ctime` are always built.


## develop
```sh
npm build  # babel
npm test
DEBUG=metalsmith-changed npm test  # test with debug output
```

## release
```sh
npm version patch|minor|major
npm publish
```
