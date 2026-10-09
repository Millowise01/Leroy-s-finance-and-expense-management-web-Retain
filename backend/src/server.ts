import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';

const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Retain API listening on port ${env.PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`Received ${signal}; shutting down`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
      return;
    }

    process.exitCode = 0;
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

server.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
