import { getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
  getFirestore,
} from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}
const apps = getApps()
export const app = apps.length ? apps[0] : initializeApp(config)
export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const functions = getFunctions(app, 'asia-northeast1')
if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
}
if (process.env.FIRESTORE_EMULATOR_HOST) {
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':')
  connectFirestoreEmulator(firestore, host, +port)
}

// test cause error because jest is node environment
;(async () => {
  if (typeof window === 'undefined') {
    return
  }
  await enableMultiTabIndexedDbPersistence(firestore)
})()

if (process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST) {
  const [host, port] = process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST.split(':')
  connectFunctionsEmulator(functions, host, +port)
}
