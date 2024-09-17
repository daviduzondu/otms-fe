'use client';
import { useSession } from 'next-auth/react';
import { createContext, ReactNode, useContext } from 'react';

interface AuthContextType {
  user: any | null; // You can type this more specifically if needed
  authLoading: string;
}

export const AuthContext = createContext<AuthContextType>({ user: null, authLoading: "" });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const authLoading = status;

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};