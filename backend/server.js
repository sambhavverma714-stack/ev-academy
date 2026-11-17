// Loads the settings first (creates backend/.env on first run)
require('./config');

const db = require('./db');
const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 5050;

async function start() {
  await db.init();
  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`EV Training School running at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Open backend/.env, change PORT to 5051, save, and start again.`);
      process.exit(1);
    }
    throw err;
  });

  // Save everything before the host stops the app
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, async () => {
      server.close();
      await db.flush();
      process.exit(0);
    });
  }
}

start().catch(err => {
  console.error('Could not start the server:', err);
  process.exit(1);
});
