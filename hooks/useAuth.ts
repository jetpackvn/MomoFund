import { auth, db } from '@/lib/firebase';
import { ACTIVITY_LOG_ACTIONS, activityLogService } from '@/services/activityLogService';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      displayName,
      email,
      createdAt: serverTimestamp(),
    });
    await activityLogService.createLog(
      credential.user.uid,
      ACTIVITY_LOG_ACTIONS.USER_REGISTERED,
      'user',
      credential.user.uid,
      `Registered user ${displayName}`
    );
    return credential.user;
  };

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await activityLogService.createLog(
      credential.user.uid,
      ACTIVITY_LOG_ACTIONS.USER_LOGIN,
      'user',
      credential.user.uid,
      `User ${credential.user.displayName || credential.user.email} logged in`
    );
    return credential.user;
  };

  const logout = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await activityLogService.createLog(
        currentUser.uid,
        ACTIVITY_LOG_ACTIONS.USER_LOGOUT,
        'user',
        currentUser.uid,
        `User ${currentUser.displayName || currentUser.email} logged out`
      );
    }
    await signOut(auth);
  };

  return { user, loading, register, login, logout };
}
