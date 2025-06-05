import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar servicios de Firebase
const auth = getAuth(app);

// Conectar al emulador de Auth en desarrollo si está configurado
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && process.env.NODE_ENV === 'development') {
  const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  connectAuthEmulator(auth, `http://${authEmulatorHost}`);
  console.log(`🔥 Usando emulador de Firebase Auth: ${authEmulatorHost}`);
}

export { app, auth };