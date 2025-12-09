import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCUVYh1xD8q-NW-1juvVjpCeS-j6d4TzKg',
  authDomain: 'convertxpro-ff904.firebaseapp.com',
  projectId: 'convertxpro-ff904',
  storageBucket: 'convertxpro-ff904.firebasestorage.app',
  messagingSenderId: '72613103704',
  appId: '1:72613103704:web:172a88dfe6d220e8d1a22d',
  measurementId: 'G-NGFGPK2SPQ'
}

const app = initializeApp(firebaseConfig)

isSupported().then((ok) => {
  if (ok) getAnalytics(app)
})

export default app
