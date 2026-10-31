import app from './app.js';
import { env } from './config/env.js';
import { connectDb, closeDb } from './config/db.js';
import { initIndexes } from './config/indexes.js';

async function startServer() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    const db = await connectDb();
    
    console.log('Initializing indexes...');
    await initIndexes(db);

    const server = app.listen(env.PORT, () => {
      console.log(`===============================================`);
      console.log(`StudioSpace Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Health endpoint: http://localhost:${env.PORT}/api/health`);
      console.log(`Studios endpoint: http://localhost:${env.PORT}/api/studios`);
      console.log(`===============================================`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await closeDb();
        console.log('Server process terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Fatal error starting StudioSpace server:', error);
    process.exit(1);
  }
}

startServer();

