import { getDatabase } from "@netlify/database";

let dbInstance: any;

try {
  dbInstance = getDatabase();
} catch (e) {
  // During next build, Netlify DB environment variables might be missing.
  // This provides a dummy instance so the build succeeds.
  dbInstance = {
    sql: async () => [],
  };
}

export const db = dbInstance;
