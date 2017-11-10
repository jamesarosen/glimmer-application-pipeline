const path = require('path');
const slice = Array.prototype.slice;

type ImportStrategy = (array: Array<string>, target: string, prepend: boolean) => boolean;

export default class AssetImporter {
  private readonly env: string;
  private readonly _vendorJSFiles: Array<string>;

  constructor(env) {
    this.env = env;
    this._vendorJSFiles = []
  }

  import({ path: pathname, prepend }) {
    importAsset(this._vendorJSFiles, pathname, prepend);
  }

  get vendorJSFiles() {
    return slice.call(this._vendorJSFiles)
  }
}

function importAsset(array, pathname, prepend) {
  const strategy = strategyFor(pathname)

  if (!strategy(array, pathname, prepend)) {
    return;
  }

  if (prepend) {
    array.unshift(pathname);
  } else {
    array.push(pathname);
  }
}

function strategyFor(pathname): ImportStrategy {
  const extension = path.extname(pathname);
  if (extension === '.js') { return firstOneWins; }
  if (extension === '.css') { return lastOneWins; }
  return alwaysImport;
}

function firstOneWins(array, target, prepend) {
  const index = array.indexOf(target);

  // Doesn't exist in the array.
  if (index === -1) { return true; }

  if (prepend) {
    // The existing entry is _after_ this inclusion and needs to be removed.
    array.splice(index, 1);
    return true;
  }

  // The existing entry is _already before_ this inclusion and would win.
  // Therefore this branch is a no-op.
  return false;
}

function lastOneWins(array, target, prepend) {
  const index = array.indexOf(target);

  // Doesn't exist in the array.
  if (index === -1) { return true; }

  if (prepend) {
    // The existing entry is _already after_ this inclusion and would win.
    // Therefore this branch is a no-op.
    return false;
  }

  // The existing entry is _before_ this inclusion and needs to be removed.
  array.splice(index, 1);
  return true;
}

function alwaysImport() {
  return true;
}
