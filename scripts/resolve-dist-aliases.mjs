import { existsSync, statSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const importPattern = /(\b(?:from|import)\s*(?:\(\s*)?)(['"])(@\/[^'"]+|\.{1,2}\/[^'"]+)\2/g;

const toPosixPath = (filePath) => filePath.split(path.sep).join('/');

const findJsFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findJsFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith('.js') ? [entryPath] : [];
    }),
  );

  return files.flat();
};

const findTargetFile = (targetBase) => {
  const candidates = [targetBase, `${targetBase}.js`, path.join(targetBase, 'index.js')];

  return candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
};

const resolveAlias = (fromFile, aliasPath) => {
  const targetBase = path.join(distDir, aliasPath);
  const targetFile = findTargetFile(targetBase);

  if (!targetFile) {
    throw new Error(`Unable to resolve @/${aliasPath} from ${path.relative(rootDir, fromFile)}`);
  }

  let relativePath = toPosixPath(path.relative(path.dirname(fromFile), targetFile));

  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
};

const resolveRelativeImport = (fromFile, importPath) => {
  if (path.extname(importPath) !== '') {
    return importPath;
  }

  const targetBase = path.resolve(path.dirname(fromFile), importPath);
  const targetFile = findTargetFile(targetBase);

  if (!targetFile) {
    throw new Error(`Unable to resolve ${importPath} from ${path.relative(rootDir, fromFile)}`);
  }

  let relativePath = toPosixPath(path.relative(path.dirname(fromFile), targetFile));

  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
};

const rewriteFile = async (filePath) => {
  const source = await readFile(filePath, 'utf8');
  let rewriteCount = 0;

  const rewritten = source.replace(importPattern, (match, prefix, quote, importPath) => {
    const resolvedPath = importPath.startsWith('@/')
      ? resolveAlias(filePath, importPath.slice(2))
      : resolveRelativeImport(filePath, importPath);

    if (resolvedPath === importPath) {
      return match;
    }

    rewriteCount += 1;

    return `${prefix}${quote}${resolvedPath}${quote}`;
  });

  if (rewriteCount > 0) {
    await writeFile(filePath, rewritten);
  }

  return rewriteCount;
};

const jsFiles = await findJsFiles(distDir);
const rewriteCounts = await Promise.all(jsFiles.map(rewriteFile));
const totalRewrites = rewriteCounts.reduce((sum, count) => sum + count, 0);

console.info(`Resolved ${totalRewrites} dist import paths.`);
