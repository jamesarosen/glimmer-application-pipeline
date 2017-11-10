const path = require('path');
const slice = Array.prototype.slice;

type ImportStrategy = (array: Array<string>, target: string, prepend: boolean) => void;

export default class AssetImporter {
  private readonly env: string;
  private readonly _testJSFiles: Array<string>;
  private readonly _vendorJSFiles: Array<string>;
  private readonly _vendorCSSFiles: Array<string>;
  private readonly _otherVendorFiles: Array<string>;

  constructor(env) {
    this.env = env;
    this._otherVendorFiles = [];
    this._testJSFiles = [];
    this._vendorCSSFiles = [];
    this._vendorJSFiles = [];
  }

  import({ path: pathname, prepend, type, using }) {
    type = type || 'vendor'

    if (type !== 'test' && type !== 'vendor') {
      throw new Error(`Invalid import type: ${type}`);
    }

    if (using && using.length > 0) {
      throw new Error('Glimmer app.import does not support transformations');
    }

    const array = this.arrayFor(pathname, type);
    importAsset(array, pathname, prepend);
  }

  get otherVendorFiles() {
    return slice.call(this._otherVendorFiles);
  }

  get testJSFiles() {
    return slice.call(this._testJSFiles);
  }

  get vendorCSSFiles() {
    return slice.call(this._vendorCSSFiles);
  }

  get vendorJSFiles() {
    return slice.call(this._vendorJSFiles);
  }

  private arrayFor(pathname, type) {
    const extension = path.extname(pathname);

    if (extension === '.js') {
      return type === 'vendor' ? this._vendorJSFiles : this._testJSFiles;
    }

    if (extension === '.css') { return this._vendorCSSFiles; }

    return this._otherVendorFiles;
  }
}

function importAsset(array, pathname, prepend) {
  strategyFor(pathname)(array, pathname, prepend);
}

function strategyFor(pathname): ImportStrategy {
  const extension = path.extname(pathname);
  if (extension === '.js') { return firstOneWins; }
  if (extension === '.css') { return lastOneWins; }
  return alwaysAppend;
}

function firstOneWins(array, target, prepend) {
  const index = array.indexOf(target);

  // Doesn't exist in the array.
  if (index === -1) { return pushOrUnshift(array, target, prepend); }

  if (prepend) {
    // The existing entry is _after_ this inclusion and needs to be removed.
    array.splice(index, 1);
    return pushOrUnshift(array, target, prepend);
  }

  // The existing entry is _already before_ this inclusion and would win.
  // Therefore this branch is a no-op.
}

function lastOneWins(array, target, prepend) {
  const index = array.indexOf(target);

  // Doesn't exist in the array.
  if (index === -1) { return pushOrUnshift(array, target, prepend); }

  if (prepend) {
    // The existing entry is _already after_ this inclusion and would win.
    // Therefore this branch is a no-op.
    return;
  }

  // The existing entry is _before_ this inclusion and needs to be removed.
  array.splice(index, 1);
  pushOrUnshift(array, target, prepend);
}

function pushOrUnshift(array, value, prepend) {
  if (prepend) {
    array.unshift(value);
  } else {
    array.push(value);
  }
}

function alwaysAppend(array, value) {
  array.push(value);
}
