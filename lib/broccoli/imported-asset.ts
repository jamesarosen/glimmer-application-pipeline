const chalk = require('chalk');
const p = require('ember-cli-preprocess-registry/preprocessors');
const path = require('path');

import { Registry } from '../interfaces';

export default class ImportedAsset {
  public readonly basename: string;
  public readonly destDir: string;
  public readonly directory: string;
  public readonly extension: string;
  public readonly isCSS: boolean;
  public readonly isTest: boolean;
  public readonly isVendor: boolean;
  public readonly outputFile: string;
  public readonly path: string;
  public readonly prepend: boolean;
  public readonly resolveFrom: boolean;
  public readonly subdirectory: string;
  public readonly type: 'vendor' | 'test';

  public static build(path, options, env): ImportedAsset | null {
    path = resolveAssetPath(path, env);
    return path === null ? path : new ImportedAsset({ path, ...options });
  }

  constructor(options) {
    this.destDir = options.destDir;
    this.outputFile = options.outputFile;
    this.path = path;
    this.prepend = options.hasOwnProperty('prepend') ? options.prepend : false;
    this.resolveFrom = options.resolveFrom;
    this.type = options.type || 'vendor';

    this.basename = path.basename(this.path);
    this.directory = path.dirname(this.path);
    this.extension = path.extname(this.path);
    this.subdirectory = this.directory.replace(new RegExp(`^vendor/|node_modules/`), '');
    this.isCSS = this.extension === '.css';
    this.isTest = this.type === 'test';
    this.isVendor = this.type === 'vendor';

    if (options.using) {
      throw new Error('Glimmer applications do not support app.import with `using`');
    }
  }

  public isJS(registry: Registry): boolean {
    return p.isType(this.path, 'js', { registry });
  }
}

function resolveAssetPath(assetPath: any, env: string): string | null {
  if (typeof assetPath !== 'object') {
    assetPath = assetPath;
  } else if (env in assetPath) {
    assetPath = assetPath[env];
  } else {
    assetPath = assetPath.development;
  }

  if (!assetPath) {
    return null;
  }

  assetPath = assetPath.split('\\').join('/');

  if (assetPath.split('/').length < 2) {
    console.log(chalk.red(`Using \`app.import\` with a file in the root of \`vendor/\` causes a significant performance penalty. Please move \`${assetPath}\` into a subdirectory.`));
  }

  if (/[*,]/.test(assetPath)) {
    throw new Error(`You must pass a file path (without glob pattern) to \`app.import\`.  path was: \`${assetPath}\``);
  }

  return assetPath;
}
