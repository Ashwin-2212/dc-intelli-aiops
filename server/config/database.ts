import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export type DbConnectionState = 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';

export interface DatabaseHealthInfo {
  state: DbConnectionState;
  readyState: number;
  databaseName?: string;
  host?: string;
  connected: boolean;
  lastConnectedAt?: string;
  lastError?: string;
}

let lastConnectedTimestamp: string | undefined;
let lastConnectionError: string | undefined;

/**
 * Sanitizes MongoDB connection URI to mask credentials in logs.
 * e.g., mongodb+srv://admin:secretPass@cluster.mongodb.net -> mongodb+srv://admin:***@cluster.mongodb.net
 */
export function sanitizeMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  } catch {
    return '[PROTECTED_URI]';
  }
}

/**
 * Maps Mongoose readyState numerical code to a human-readable state string.
 */
export function getDbConnectionState(): DbConnectionState {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'uninitialized';
  }
}

/**
 * Returns diagnostic metadata regarding the active MongoDB connection.
 */
export function getDatabaseHealth(): DatabaseHealthInfo {
  const readyState = mongoose.connection.readyState;
  const state = getDbConnectionState();
  const isConnected = readyState === 1;

  return {
    state,
    readyState,
    databaseName: isConnected ? mongoose.connection.name : undefined,
    host: isConnected ? mongoose.connection.host : undefined,
    connected: isConnected,
    lastConnectedAt: lastConnectedTimestamp,
    lastError: lastConnectionError,
  };
}

/**
 * Centralized MongoDB Connection Manager with auto-reconnection and error handling.
 */
export async function connectDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGODB_URI environment variable is not defined.';
    lastConnectionError = errorMsg;
    console.warn(`[Database Warning] ${errorMsg} MongoDB persistence is disabled.`);
    return false;
  }

  // Avoid creating redundant connections if already connected or connecting
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (mongoose.connection.readyState === 2) {
    // Wait for in-flight connection
    await new Promise<void>((resolve) => {
      mongoose.connection.once('connected', () => resolve());
      mongoose.connection.once('error', () => resolve());
    });
    return (mongoose.connection.readyState as number) === 1;
  }

  const sanitizedUri = sanitizeMongoUri(uri);

  try {
    // Attach connection event listeners once
    if (mongoose.connection.listenerCount('error') === 0) {
      mongoose.connection.on('connected', () => {
        lastConnectedTimestamp = new Date().toISOString();
        lastConnectionError = undefined;
        console.log(`[Database] MongoDB connection established: ${mongoose.connection.name} @ ${mongoose.connection.host}`);
      });

      mongoose.connection.on('error', (err: any) => {
        lastConnectionError = err?.message || String(err);
        console.error('[Database Error] MongoDB runtime connection error:', lastConnectionError);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[Database Warning] MongoDB disconnected. Reconnection will be attempted automatically.');
      });

      mongoose.connection.on('reconnected', () => {
        lastConnectedTimestamp = new Date().toISOString();
        console.log('[Database] MongoDB successfully reconnected.');
      });
    }

    console.log(`[Database] Connecting to MongoDB: ${sanitizedUri}...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      minPoolSize: 2,
    });

    lastConnectedTimestamp = new Date().toISOString();
    lastConnectionError = undefined;
    return true;
  } catch (error: any) {
    lastConnectionError = error?.message || 'Failed to establish MongoDB connection';
    console.error(`[Database Error] Could not connect to MongoDB (${sanitizedUri}):`, lastConnectionError);
    // Graceful degradation: do not throw to allow server to stay responsive with fallback
    return false;
  }
}

/**
 * Gracefully closes the database connection.
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    console.log('[Database] Closing MongoDB connection...');
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed.');
  }
}

/**
 * Pings the connected MongoDB instance to verify operational readiness.
 */
export async function pingDatabase(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return { ok: false, error: 'Database is not currently connected' };
  }

  const start = Date.now();
  try {
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();
    const latencyMs = Date.now() - start;
    return { ok: pingResult.ok === 1, latencyMs };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Database ping command failed' };
  }
}
