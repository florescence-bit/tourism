import fs from 'fs';
import path from 'path';

function loadEnv(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/\r?\n/);
  const env = {};
  for (const l of lines) {
    const s = l.trim();
    if (!s || s.startsWith('#')) continue;
    const idx = s.indexOf('=');
    if (idx === -1) continue;
    const k = s.slice(0, idx).trim();
    const v = s.slice(idx + 1).trim();
    env[k] = v;
  }
  return env;
}

async function main() {
  const root = path.resolve(process.cwd());
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found in project root. Cannot proceed.');
    process.exit(2);
  }

  const env = loadEnv(envPath);
  const cfg = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!cfg.apiKey || !cfg.projectId) {
    console.error('Firebase config incomplete in .env.local. Please provide API key and project id.');
    process.exit(3);
  }

  try {
    const { initializeApp } = await import('firebase/app');
    const { getAuth, signInAnonymously } = await import('firebase/auth');
    const { getFirestore, collection, getDocs, query, limit } = await import('firebase/firestore');

    const app = initializeApp(cfg);
    console.log('Firebase app initialized for project:', cfg.projectId);

    const auth = getAuth(app);
    try {
      const res = await signInAnonymously(auth);
      console.log('Anonymous auth success, uid=', res.user.uid);
    } catch (authErr) {
      console.warn('Anonymous auth failed:', authErr && authErr.message ? authErr.message : authErr);
    }

    const db = getFirestore(app);
    try {
      // Try a lightweight read: list up to 1 doc from a public collection (if none exist this will be empty but succeed)
      const col = collection(db, 'test_probe');
      const q = query(col, limit(1));
      const snaps = await getDocs(q);
      console.log('Firestore read OK — documents found:', snaps.size);
    } catch (dbErr) {
      console.warn('Firestore read failed:', dbErr && dbErr.message ? dbErr.message : dbErr);
    }

    process.exit(0);
  } catch (e) {
    console.error('Firebase SDK load/init failed:', e && e.message ? e.message : e);
    process.exit(4);
  }
}

main();
