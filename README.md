# metalsmith-changed
Only process files that have changed. **Must** be used with `.clean(false)`, as
it uses the ctime of output files to decide if file should be processed.


## example
```js
var Metalsmith = require('metalsmith');
var changed = require('metalsmith-changed');

var metalsmith = Metalsmith(__dirname)
  .clean(false)
  .use(changed())
  ... // more plugins
  .build(function(err){
    if (err) throw err;
  });
```


Which is useful when using `gulp.watch`:

```js
var Metalsmith = require('metalsmith');
var changed = require('metalsmith-changed');
var gulp = require('gulp');
var path = require('path');

function build(force){
  return function(cb){
    var metalsmith = Metalsmith(__dirname)
      .clean(false)
      .use(changed({
        force: force // forces build even if files has not changed
      }))
      ... // more plugins
      .build(cb);
  }
}

// only build changed files
gulp.watch(path.join(__dirname, 'src', '**'), build(false));

// force build of all files
gulp.watch(path.join(__dirname, 'templates', '**'), build(true));
```


## extnames
As default, the plugin looks for same extname in build folder. When converting
files, say from markdown to html, define an extname map:

```js
var metalsmith = Metalsmith(__dirname)
  .clean(false)
  .use(changed({
    extnames: {
      '.md': '.html' // build if src/file.md is newer than build/file.html
    }
  }))
  ... // more plugins
  .build(function(err){
    if (err) throw err;
  });
```


## forcePattern
If the option `forcePattern` is defined, files matching the pattern(s) will not
be removed from building even if the file has not changed. `forcePattern` should
be a string or an array of strings.
[micromatch.any](https://github.com/jonschlinkert/micromatch#any) is used for
matching the files.

Example:
```js
var metalsmith = Metalsmith(__dirname)
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
  force: false,  // force build of all files
  extnames: {},  // map input to output extnames
  forcePattern: ''  // always build files matching pattern(s)
})
```


## test
```sh
npm install
npm install metalsmith
touch test/src/index.md
npm test
npm test
```
