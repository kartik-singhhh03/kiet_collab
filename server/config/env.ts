/**
 * Centralised env validation — call once at startup.
 * Throws if any required variable is missing.
 */
export function validateEnv(): void {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env variables: ${missing.join(', ')}`);
  }
}
