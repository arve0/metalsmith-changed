/* eslint-env mocha */
'use strict';

var fs = require('fs');
var touch = require('touch');
var assert = require('assert');
var dirEqual = require('assert-dir-equal');
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

  it('should always remove `metalsmith-changed-ctimes.json`', function (done) {
    Metalsmith(FIXTURES)
      .clean(true)
      .use(changed())
      .build(function (err, files) {
        var ctimes = 'metalsmith-changed-ctimes.json';
        var ctimesNotFound = Object.keys(files).indexOf(ctimes) === -1;
        assert(ctimesNotFound);
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
        assert.equal(Object.keys(files).length, 2);

        dirEqual(join(FIXTURES, 'expected'), join(FIXTURES, 'build'));
        done(err);
      });
  });

  it('should build files which has new ctime', function (done) {
    touch.sync(join(FIXTURES, '/src/changed.md'));

    Metalsmith(FIXTURES)
      .clean(false)
      .use(changed())
      .build(function (err, files) {
        assert.equal(Object.keys(files).length, 1);

        dirEqual(join(FIXTURES, 'expected'), join(FIXTURES, 'build'));
        done(err);
      });
  });

  it('should build files without `file.stats.ctime`', function (done) {
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
        assert.equal(Object.keys(files).length, 2);

        dirEqual(join(FIXTURES, 'expected-generated'), join(FIXTURES, 'build'));
        done(err);
      });
  });

});
