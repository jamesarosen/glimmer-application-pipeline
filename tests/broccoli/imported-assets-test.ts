import AssetImporter from '../../lib/broccoli/asset-importer';

const expect = require('../helpers/chai').expect;

describe('asset-importer', function() {
  let importer;

  beforeEach(function() {
    importer = new AssetImporter('test');
  });

  // TODO: change the accessor APIs to be Broccoli trees

  describe('importing a file into vendor.js', function() {
    it('adds the file to the end of the list', function() {
      importer.import({ path: 'a.js' });
      importer.import({ path: 'b.js' });
      expect(importer.vendorJSFiles).to.eql([ 'a.js', 'b.js' ]);
    });

    it('supports prepending', function() {
      importer.import({ path: 'a.js' });
      importer.import({ path: 'b.js', prepend: true });
      expect(importer.vendorJSFiles).to.eql([ 'b.js', 'a.js' ]);
    });

    it('prevents duplicates, preferring the first import', function() {
      importer.import({ path: 'a.js' });
      importer.import({ path: 'b.js' });
      importer.import({ path: 'c.js' });
      importer.import({ path: 'b.js' });
      expect(importer.vendorJSFiles).to.eql([ 'a.js', 'b.js', 'c.js' ]);
    });

    it('prevents duplicates when prepending', function() {
      importer.import({ path: 'a.js', prepend: true });
      importer.import({ path: 'b.js', prepend: true });
      importer.import({ path: 'c.js', prepend: true });
      importer.import({ path: 'b.js', prepend: true });
      expect(importer.vendorJSFiles).to.eql([ 'b.js', 'c.js', 'a.js' ]);
    });
  });

  describe('importing a file into vendor.css', function() {
    it('adds the file to the end of the list', function() {
      importer.import({ path: 'a.css' });
      importer.import({ path: 'b.css' });
      expect(importer.vendorCSSFiles).to.eql([ 'a.css', 'b.css' ]);
    });

    it('supports prepending', function() {
      importer.import({ path: 'a.css' });
      importer.import({ path: 'b.css', prepend: true });
      expect(importer.vendorCSSFiles).to.eql([ 'b.css', 'a.css' ]);
    });

    it('prevents duplicates, preferring the last import', function() {
      importer.import({ path: 'a.css' });
      importer.import({ path: 'b.css' });
      importer.import({ path: 'c.css' });
      importer.import({ path: 'b.css' });
      expect(importer.vendorCSSFiles).to.eql([ 'a.css', 'c.css', 'b.css' ]);
    });

    it('prevents duplicates when prepending', function() {
      importer.import({ path: 'a.css', prepend: true });
      importer.import({ path: 'b.css', prepend: true });
      importer.import({ path: 'c.css', prepend: true });
      importer.import({ path: 'b.css', prepend: true });
      expect(importer.vendorCSSFiles).to.eql([ 'c.css', 'b.css', 'a.css' ]);
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
