import { useState, useEffect } from 'react';
import { onAuthStateChange, auth } from '@/lib/firebase';
import type { User } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Check for development mode user first
    const devUser = localStorage.getItem('dev_user');
    if (devUser && localStorage.getItem('firebase_token') === 'dev-mock-token') {
      console.log('Using development mode authentication');
      setUser(JSON.parse(devUser));
      setIsLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        try {
          // Convert Firebase user to our User type
          const idToken = await firebaseUser.getIdToken();
          console.log('Got Firebase ID token');
          
          // Store token for API requests
          localStorage.setItem('firebase_token', idToken);
          // Clear any dev user data
          localStorage.removeItem('dev_user');
          
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: firebaseUser.photoURL || 'https://via.placeholder.com/150'
          };
          
          console.log('User data prepared:', userData.email);
          setUser(userData);
        } catch (error) {
          console.error('Error processing Firebase user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('dev_user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      console.log('Logging out...');
      
      // Check if we're in dev mode
      if (localStorage.getItem('firebase_token') === 'dev-mock-token') {
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('dev_user');
        setUser(null);
        console.log('Dev mode logout successful');
        return;
      }
      
      // Regular Firebase logout
      const { signOut } = await import('@/lib/firebase');
      await signOut();
      setUser(null);
      localStorage.removeItem('firebase_token');
      localStorage.removeItem('dev_user');
      console.log('Logout successful');
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
