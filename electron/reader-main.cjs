const { app } = require('electron');
const path = require('node:path');

// Reader builds keep a separate local profile from the earlier personal desktop build.
// This UI needs little graphics acceleration; keep rendering behavior simple on varied PCs.
app.disableHardwareAcceleration();
app.setName('doin Reader');
app.setPath('userData', process.env.DOIN_READER_TEST_PROFILE || path.join(app.getPath('appData'), 'doin-reader'));

require('./main.cjs');
