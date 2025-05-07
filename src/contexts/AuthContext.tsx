
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  name: string;
  isDemoAccount?: boolean;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing user session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call - In a real app, this would validate against a backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Simple validation - in a real app, this would be done by the backend
          if (email === 'demo@example.com' || (email.includes('@') && password.length >= 6)) {
            const isDemoAccount = email === 'demo@example.com';
            const newUser = { 
              email, 
              name: isDemoAccount ? 'Demo User' : email.split('@')[0],
              isDemoAccount,
              emailVerified: isDemoAccount || Math.random() > 0.5 // Randomly simulate verified/unverified for non-demo
            };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            resolve();
          } else {
            reject(new Error('Invalid credentials'));
          }
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call - In a real app, this would create a user in the backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // In a real app, this would be handled by the backend
          const newUser = { 
            email, 
            name,
            emailVerified: false // New accounts start as unverified
          };
          
          // In a real app, we wouldn't set the user here until they verify their email
          // For demo purposes, we'll store it but not log them in automatically
          localStorage.setItem('pendingUser', JSON.stringify(newUser));
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
