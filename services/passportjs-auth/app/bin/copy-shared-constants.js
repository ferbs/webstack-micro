#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

// mostly copy-pasted from frontend-web (meh) but now with bonus meh TypeScript hacks

const actualDataDir = '/usr/local/shared-constants/';
const projectRoot = path.resolve(__dirname, '..');
const sharedConstantDirName = 'shared-constants.generated';

fs.mkdirpSync(path.join(projectRoot, 'dist', sharedConstantDirName));
fs.copySync(actualDataDir, path.join(projectRoot, 'src', sharedConstantDirName), { overwrite: true });
fs.copySync(actualDataDir, path.join(projectRoot, 'dist', sharedConstantDirName), { overwrite: true });
