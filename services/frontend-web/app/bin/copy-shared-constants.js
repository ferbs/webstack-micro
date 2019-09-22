#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

const rootImportDir = path.resolve(__dirname, '../src');

// TODO: prepend to each: "Generated file. DO NOT MODIFY HERE! See soruce in _____"
fs.copySync('/usr/local/shared-constants/', path.join(rootImportDir, 'shared-constants.generated'), { overwrite: true });
