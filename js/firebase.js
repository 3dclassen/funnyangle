import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBwzS6JCyRVYphAZe9hJ_E_AcrYTRH6988",
  authDomain: "funnyangle.firebaseapp.com",
  projectId: "funnyangle",
  storageBucket: "funnyangle.firebasestorage.app",
  messagingSenderId: "595026834333",
  appId: "1:595026834333:web:d6e382185796708cc87574"
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function ensureUserProfile(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      display_name: user.displayName || 'Anonym',
      role: 'user',
      created_at: serverTimestamp()
    });
  }
}
