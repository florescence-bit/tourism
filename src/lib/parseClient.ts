// Prefer main entry so TypeScript can find types
import Parse from 'parse';

export function initParse() {
  // Initialize Parse only once on the client
  if (typeof window === 'undefined') return Parse;

  if (!(globalThis as any).__PARSE_INITIALIZED) {
    const appId = process.env.NEXT_PUBLIC_PARSE_APP_ID || '';
    const jsKey = process.env.NEXT_PUBLIC_PARSE_JS_KEY || '';
    const serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL || '';

    if (appId && serverURL) {
      Parse.initialize(appId, jsKey);
      Parse.serverURL = serverURL;
    }
    (globalThis as any).__PARSE_INITIALIZED = true;
  }

  return Parse;
}
