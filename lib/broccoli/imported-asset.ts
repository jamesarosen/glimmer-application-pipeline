const chalk = require('chalk');
const path = require('path');

export default class ImportedAsset {
  public readonly destDir: String;
  public readonly outputFile: String;
  public readonly path: String;
  public readonly prepend: Boolean;
  public readonly resolveFrom: Boolean;
  public readonly type: 'vendor' | 'test';
  public readonly using: Array<any>;

  public static build(path, options, env): ImportedAsset | null {
    path = resolveAssetPath(path, env);
    return path === null ? path : new ImportedAsset({ path, ...options });
  }

  constructor(options) {
    this.destDir = options.destDir;
    this.outputFile = options.outputFile;
    this.path = options.path;
    this.prepend = options.hasOwnProperty('prepend') ? options.prepend : false;
    this.resolveFrom = options.resolveFrom;
    this.type = options.type || 'vendor';
    this.using = options.using;
  }

  public get directory() {
    return path.dirname(this.path);
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
