'use client'
import { getAuth, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import firebaseApp from '../config/firebase/firebase.config';
import { useRouter } from 'next/navigation';

const auth = getAuth(firebaseApp);

interface AuthContextType {
 user: User | null;
 authLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, authLoading: true });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
 const [user, setUser] = useState<User | null>(null);
 const [authLoading, setAuthLoading] = useState<boolean>(true);

 useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
   setUser(user);
   setAuthLoading(false);
  });

  return () => unsubscribe();
 }, []);


 return (
  <AuthContext.Provider value={{ user, authLoading }}>
   {children}
  </AuthContext.Provider>
 );
};
