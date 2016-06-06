const Metalsmith = require('metalsmith');
const changed = require('./');
const nodeStatic = require('node-static');
const livereload = require('metalsmith-livereload');
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
 * Open browser. Wait to allow livereload server to start.
 */
setTimeout(() => open('http://localhost:8080'), 1000);
