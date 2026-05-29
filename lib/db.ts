/**
 * lib/db.ts — MongoDB Connection with Global Caching
 *
 * WHY GLOBAL CACHING?
 * Next.js API routes are stateless serverless functions. Without caching,
 * every incoming HTTP request would open a brand-new TCP connection to MongoDB
 * and never close it — leaking connections and degrading performance.
 *
 * The fix: store the Mongoose connection (and the in-flight connection promise)
 * on Node's `global` object. Because `global` survives between invocations in
 * the same serverless container, subsequent requests reuse the connection that
 * was already established by the first request in that container.
 *
 * Usage: `await connectDB()` at the start of every API route handler.
 */

import mongoose from 'mongoose';

// ── Environment guard ────────────────────────────────────────────────────────
// Fail loudly at server startup if the environment variable is missing,
// rather than getting a confusing runtime error inside a route handler.
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

// ── Global connection cache ───────────────────────────────────────────────────
// `global` is the only object that persists across Next.js hot-reloads in dev
// and across invocations within the same Lambda/container in prod.
let cached = (global as any).mongoose;

// Initialise the cache structure on the very first module load
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Fast path: return immediately if a live connection already exists
  if (cached.conn) {
    return cached.conn;
  }

  // Slow path (first call): create the connection promise.
  // If two requests arrive simultaneously, they both await the SAME promise
  // rather than each starting their own connection.
  if (!cached.promise) {
    const opts = {
      // Disable internal Mongoose command buffering.
      // Without this, operations queue silently if the DB is down.
      // With this, they throw immediately — better for debugging.
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully');
        return mongoose;
      });
  }

  try {
    // Store the resolved connection in the cache for all future requests
    cached.conn = await cached.promise;
  } catch (e) {
    // On failure, clear the promise so the next request retries from scratch
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
