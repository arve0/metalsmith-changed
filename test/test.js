/* eslint-env mocha */
'use strict';

var fs = require('fs');
var touch = require('touch');
var assert = require('assert');
var join = require('path').join;

var Metalsmith = require('metalsmith');
var changed = require('../');

const FIXTURES = join(__dirname, 'fixtures');

describe('metalsmith-changed', function () {
  beforeEach(function () {
    // remove files in build dir
    var generatedFiles = ['asdf.md', 'fdsa.md'];
    generatedFiles.map(f => {
      try {
        fs.unlinkSync(join(FIXTURES, 'build', f))
      } catch (e) {}
    });
  });

  it('should add `metalsmith-changed-ctimes.json`', function (done) {
    Metalsmith(FIXTURES)
      .clean(true)
      .use(changed())
      .build(function (err, files) {
        var ctimes = 'metalsmith-changed-ctimes.json';
        var ctimesFound = Object.keys(files).indexOf(ctimes) !== -1;
        assert(ctimesFound, ctimes + ' not found');
        done(err);
      });
  });

  it('should build all files on force: true', function (done) {
    Metalsmith(FIXTURES)
      .clean(false)
      .use(changed({
        force: true
      }))
      .build(function (err, files) {
        // three files including ctimes.json
        assert.equal(Object.keys(files).length, 3);
        done(err);
      });
  });

  it('should work with [array, of, patterns]', function (done) {
    Metalsmith(FIXTURES)
      .clean(false)
      .use(changed({
        forcePattern: ['asdf', '*.md']
      }))
      .build(function (err, files) {
        assert.equal(Object.keys(files).length, 2);
        done(err);
      });
  });

  it('should only build files which has new ctime', function (done) {
    touch.sync(join(FIXTURES, '/src/changed.md'));

    Metalsmith(FIXTURES)
      .clean(false)
      .use(changed())
      .build(function (err, files) {
        assert.equal(Object.keys(files).length, 2);
        done(err);
      });
  });

  it('should not remove files missing `file.stats.ctime`', function (done) {
    /**
     * Typically files created through other plugins.
     */

    Metalsmith(FIXTURES)
      .clean(false)
      .use(function (files) {
        files['asdf.md'] = {
          title: 'asdf',
          contents: '1234'
        };
        files['fdsa.md'] = {
          title: 'asdf',
          contents: '1234',
          stats: {
            ctime: new Date(1970, 1)
          }
        };
      })
      .use(changed())
      .build(function (err, files) {
        assert.equal(Object.keys(files).length, 3);
        done(err);
      });
  });

  it('should force build all files when metafiles are changed', function (done) {

    Metalsmith(FIXTURES)
      .clean(false)
      .use(function (files) {
        files['metafile.json'] = {
          title: 'asdf',
          contents: '1234'
        };
      })
      .use(changed({
        forceAllPattern: 'metafile.json'
      }))
      .build(function (err, files) {
        assert.equal(Object.keys(files).length, 4);
        done(err);
      });
  });
});
