#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

// copy-pasted from frontend-web, meh.. see notes there.
const rootImportDir = path.resolve(__dirname, '../src');


fs.copySync('/usr/local/shared-constants/', path.join(rootImportDir, 'shared-constants.generated'), { overwrite: true });
