'use strict';

var join = require('path').join;
var fs = require('fs');
var assert = require('assert');
var dir_equal = require('assert-dir-equal');

var Metalsmith = require('metalsmith');
var changed = require('../');

var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var collections = require('metalsmith-collections');
var feed = require('metalsmith-feed');
var gulp = require('gulp');
var gulpsmith = require('gulpsmith');

function assertPluginWorked(src, unchanged, done) {
  return function (err, files) {
    if (err) return done(err);
    assert.equal(Object.keys(files).length, unchanged);
    dir_equal(join(src, 'expected'), join(src, 'build'));
    done();
  };
}

function assertPluginWorkedWithFeed(src, unchanged, done) {
  return function (err, files) {
    if (err) return done(err);
    assert.equal(Object.keys(files).length, unchanged);
    // rss.xml has a build date that will always differ so don't compare file content
    assert.equal(
      fs.readdirSync(join(src, 'expected')).length,
      fs.readdirSync(join(src, 'build')).length
    );
    done();
  };
}

describe('metalsmith-changed', function () {
  it('should ignore an unchanged file', function (done) {
    var src = 'test/fixtures/minimal';

    Metalsmith(src)
      .clean(false)
      .use(changed())
      .build(assertPluginWorked(src, 0, done));
  });

  it('should ignore unchanged markdown files', function (done) {
    var src = 'test/fixtures/markdown';

    Metalsmith(src)
      .clean(false)
      .use(changed({
        extnames: {
          '.md': '.html'
        }
      }))
      .use(markdown())
      .build(assertPluginWorked(src, 0, done));
  });

  it('should ignore unchanged files processed through permalinks :date', function (done) {
    var src = 'test/fixtures/permalinks';

    /**
     Problems with this use case:

     1) Since permalinks changes the destination path, checking by filename
        doesn't work. changed() must run after permalinks and src stats object
        is pulled from files[file] rather than looking for a file named the same
        in destination directory.

        To make it more compatible, changed would need to know the permalink
        pattern for destination files before permalinks runs and map the files
        accordingly.
    **/

    Metalsmith(src)
      .clean(false)
      .use(permalinks({
        pattern: ':date/:title'
      }))
      .use(changed()) // must run after permalinks
      .build(assertPluginWorked(src, 0, done));
  });

  it('should ignore unchanged markdown files processed through permalinks :date', function (done) {
    var src = 'test/fixtures/markdown-permalinks';

    /**
     Problems with this use case:

     1) markdown needs to run before permalinks because it checks for markdown
        extensions (permalinks wipes out the extensions converting pages to
        index.html)
     2) changed must run after permalinks
     3) Resulting order of markdown -> permalinks -> changed means that markdown
        conversion always runs regardless of file being changed or not.
    **/

    Metalsmith(src)
      .clean(false)
      .use(changed({
        extnames: {
          '.md': '.html'
        }
      }))
      .use(markdown()) // must run before permalinks
      .use(permalinks({
        pattern: ':date/:title'
      }))
      .use(changed()) // must run after permalinks
      .build(assertPluginWorked(src, 0, done));
  });

  it('plugin-created files should always be considered unchanged', function (done) {
    var src = 'test/fixtures/generated-files';

    /**
     Problems with this use case:

     Files created by plugins such as metalsmith-feed, metalsmith-sitemap, and
     metalsmith-collections don't map to a source file and thus will not have
     a stats object. These will always be built.

     Since they always need to be built, they may need access to all files
     before changed removes them from the build list. For example, if feed is
     created after changed, it will produce a feed without unchanged files.
    **/

    Metalsmith(src)
      .clean(false)
      .metadata({
        site: {
          url: 'http://example.com'
        }
      })
      .use(collections({
        pages: {
          pattern: '*.html',
          sortBy: 'date'
        }
      }))
      .use(feed({
        collection: 'pages'
      }))
      .use(changed()) // needs to run after feed
      .build(assertPluginWorkedWithFeed(src, 1, done));
  });

  it('should work in gulpsmith');
});