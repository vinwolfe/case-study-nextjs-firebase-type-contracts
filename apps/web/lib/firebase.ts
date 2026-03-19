import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-case-study',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Global flags prevent double-connection during Next.js Fast Refresh
declare global {
  var __firestoreEmulatorConnected: boolean | undefined;
  var __functionsEmulatorConnected: boolean | undefined;
}

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  if (!global.__firestoreEmulatorConnected) {
    connectFirestoreEmulator(db, 'localhost', 8080);
    global.__firestoreEmulatorConnected = true;
  }
  if (!global.__functionsEmulatorConnected) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    global.__functionsEmulatorConnected = true;
  }
}
