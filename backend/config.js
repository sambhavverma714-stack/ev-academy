// Loads backend/.env. On first run, or if the secrets are still placeholders,
// it creates the file with new random secrets so nobody has to edit it by hand.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_FILE = path.join(__dirname, '.env');
const PLACEHOLDER = 'replace-this';

require('dotenv').config({ path: ENV_FILE });

const settings = {
  PORT: process.env.PORT || '5050',
  JWT_SECRET: process.env.JWT_SECRET,
  CERT_SECRET: process.env.CERT_SECRET
};

// Remember which secrets were really provided (for example on Render)
const fromEnv = {};
for (const key of ['JWT_SECRET', 'CERT_SECRET']) {
  fromEnv[key] = !!settings[key] && !settings[key].startsWith(PLACEHOLDER);
}

let changed = !fs.existsSync(ENV_FILE);
for (const key of ['JWT_SECRET', 'CERT_SECRET']) {
  if (!settings[key] || settings[key].startsWith(PLACEHOLDER)) {
    settings[key] = crypto.randomBytes(48).toString('hex');
    changed = true;
  }
}

if (changed) {
  try {
    fs.writeFileSync(
      ENV_FILE,
      '# Created automatically. Keep this file private and do not share it.\n' +
      `PORT=${settings.PORT}\n` +
      `JWT_SECRET=${settings.JWT_SECRET}\n` +
      `CERT_SECRET=${settings.CERT_SECRET}\n`
    );
    console.log('Created backend/.env with new random secrets');
  } catch (err) {
    console.log('Could not write backend/.env (read-only disk). Using temporary secrets.');
  }
}

process.env.PORT = settings.PORT;
process.env.JWT_SECRET = settings.JWT_SECRET;
process.env.CERT_SECRET = settings.CERT_SECRET;

settings.fromEnv = fromEnv;
module.exports = settings;