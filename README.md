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


## default options
```js
changed({
  force: false, // force build of all files
  extnames: {}  // map input to output extnames
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

