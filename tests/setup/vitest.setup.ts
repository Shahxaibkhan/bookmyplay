import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Prefer project-specific overrides before falling back to default .env
const envLocalPath = resolve(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else {
  config();
}

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_MEMORY_SERVER__: MongoMemoryServer | undefined;
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'test-secret';
}

const ensureMongoServer = async () => {
  if (process.env.MONGODB_URI) {
    return;
  }
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  globalThis.__MONGO_MEMORY_SERVER__ = mongo;
};

const mongoServerReady = ensureMongoServer();

afterAll(async () => {
  await mongoServerReady;
  if (globalThis.__MONGO_MEMORY_SERVER__) {
    await globalThis.__MONGO_MEMORY_SERVER__.stop();
    globalThis.__MONGO_MEMORY_SERVER__ = undefined;
  }
});
