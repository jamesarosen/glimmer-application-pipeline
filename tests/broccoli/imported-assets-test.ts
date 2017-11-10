import AssetImporter from '../../lib/broccoli/asset-importer';

const expect = require('../helpers/chai').expect;

describe('asset-importer', function() {
  let importer;

  beforeEach(function() {
    importer = new AssetImporter('test');
  });

  // TODO: change the accessor APIs to be Broccoli trees

  describe('importing JS files', function() {
    it('appends and prepends, prefering the earliest import', function() {
      importer.import({ path: 'a.js' });
      importer.import({ path: 'b.js' });
      importer.import({ path: 'c.js', prepend: true });
      importer.import({ path: 'b.js', prepend: true });
      importer.import({ path: 'd.js' });

      expect(importer.vendorJSFiles).to.eql([
        'b.js',
        'c.js',
        'a.js',
        'd.js'
      ]);
    });

    it('disallows transformations', function() {
      expect(function() {
        importer.import({ path: 'a.js', using: [ { transformation: 'anyting' } ] });
      }).to.throw(/Glimmer app.import does not support transformations/);
    });

    it('allows bucketing files into vendor and test', function() {
      importer.import({ path: 'a.js' });
      importer.import({ path: 'b.js', type: 'test' });

      expect(importer.vendorJSFiles).to.eql([ 'a.js' ]);
      expect(importer.testJSFiles).to.eql([ 'b.js' ]);

      expect(function() {
        importer.import({ path: 'c.js', type: 'something-else' });
      }).to.throw(/Invalid import type: something-else/);
    });
  });

  describe('importing CSS files', function() {
    it('appends and prepends, prefering the latest import', function() {
      importer.import({ path: 'a.css' });
      importer.import({ path: 'b.css' });
      importer.import({ path: 'c.css', prepend: true });
      importer.import({ path: 'b.css', prepend: true });
      importer.import({ path: 'd.css' });

      expect(importer.vendorCSSFiles).to.eql([
        'c.css',
        'a.css',
        'b.css',
        'd.css'
      ]);
    });

    it('allows bucketing files into vendor and test', function() {
      importer.import({ path: 'a.css' });
      importer.import({ path: 'b.css', type: 'test' });

      expect(importer.vendorCSSFiles).to.eql([ 'a.css' ]);
      expect(importer.testCSSFiles).to.eql([ 'b.css' ]);

      expect(function() {
        importer.import({ path: 'c.css', type: 'custom' });
      }).to.throw(/Invalid import type: custom/);
    });
  });

  describe('importing other files', function() {
    it('adds the file to the end of the list', function() {
      importer.import({ path: 'a.woff' });
      importer.import({ path: 'b.svg' });
      importer.import({ path: 'c.pdf', prepend: true });
      expect(importer.otherVendorFiles).to.eql([ 'a.woff', 'b.svg', 'c.pdf' ]);
    });
  });
});
