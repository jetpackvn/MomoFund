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
import { doc, serverTimestamp, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        unsubscribeDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const status = (data?.account_status || data?.accountStatus || '').toLowerCase();
              if (status === 'locked') {
                const reason = data?.locked_reason || data?.lockedReason || 'Không có lý do cụ thể';
                signOut(auth);
                Alert.alert('Thông báo', `Tài khoản bạn bị khoá vì lý do: ${reason}`);
                setUser(null);
                setLoading(false);
                return;
              }
            }
            setUser(firebaseUser);
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to user document:', error);
            setUser(firebaseUser);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const register = async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      displayName,
      email,
      accountStatus: 'active',
      account_status: 'active',
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
    
    // Check account status before proceeding
    const userDocRef = doc(db, 'users', credential.user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const status = (data?.account_status || data?.accountStatus || '').toLowerCase();
      if (status === 'locked') {
        await signOut(auth);
        const reason = data?.locked_reason || data?.lockedReason || 'Không có lý do cụ thể';
        throw new Error(`Tài khoản của bạn đã bị khoá với lý do: ${reason}`);
      }
    }

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
