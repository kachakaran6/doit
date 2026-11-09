const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch monorepo root so export:embed and workspace packages resolve
config.watchFolders = [monorepoRoot];

// 2. Block non-mobile directories to keep Windows file watcher fast
config.resolver.blockList = [
  /.*[/\\]apps[/\\]api[/\\].*/,
  /.*[/\\]apps[/\\]web[/\\].*/,
  /.*[/\\]screenshots[/\\].*/,
  /.*[/\\]release-builds[/\\].*/,
  /.*[/\\]\.git[/\\].*/,
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

config.maxWorkers = 2;

module.exports = config;

