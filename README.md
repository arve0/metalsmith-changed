[![npm version](https://badge.fury.io/js/metalsmith-changed.svg)](https://badge.fury.io/js/metalsmith-changed) [![Build Status](https://travis-ci.org/arve0/metalsmith-changed.svg?branch=master)](https://travis-ci.org/arve0/metalsmith-changed)

# metalsmith-changed
Only process files that have changed. **Must** be used with `.clean(false)`, as
it removes files from the build. `Metalsmith.clean(true)` will disable this plugin.

Writes a json file with ctimes to your `src`-folder.


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

Which is useful when using `gulp.watch`:
```js
var Metalsmith = require('metalsmith');
var changed = require('metalsmith-changed');
var gulp = require('gulp');
var path = require('path');

function build (force) {
  return function (cb) {
    Metalsmith()
      .clean(force)  // forces build even if files has not changed
      .use(changed())
      ... // more plugins
      .build(cb);
  }
}

// only build changed files
gulp.watch(path.join(__dirname, 'src', '**'), build(false));

// force build of all files
gulp.watch(path.join(__dirname, 'templates', '**'), build(true));
```


## metalsmith-changed-ctimes.json
`metalsmith-changed-ctimes.json` is written to your `src` folder upon every build. `metalsmith-changed` takes ctimes from `files[n].stats.ctime`, so if your plugin creates files with `.stats.ctime`, `metalsmith-changed` can be used  with it.

Files without `stats.ctime` are always built.


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


## scripts
```sh
npm build-expected  # see test/fixtures
npm test
npm build  # babel
```

## release
```sh
npm version patch|minor|major
npm publish
```
