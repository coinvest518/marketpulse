import { useState, useEffect } from 'react';
import { onAuthStateChange, auth } from '@/lib/firebase';
import type { User } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Convert Firebase user to our User type
        const idToken = await firebaseUser.getIdToken();
        
        // Store token for API requests
        localStorage.setItem('firebase_token', idToken);
        
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: firebaseUser.photoURL || 'https://via.placeholder.com/150'
        };
        
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem('firebase_token');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const { signOut } = await import('@/lib/firebase');
      await signOut();
      setUser(null);
      localStorage.removeItem('firebase_token');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout
  };
}
