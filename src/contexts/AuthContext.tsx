
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

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
  updateProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
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

  // Login function with email verification check
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call - In a real app, this would validate against a backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Simple validation - in a real app, this would be done by the backend
          const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          const demoUser = { 
            email: 'demo@example.com', 
            name: 'Demo User',
            isDemoAccount: true,
            emailVerified: true
          };
          
          // Check if it's the demo account
          if (email === 'demo@example.com' && password === 'password') {
            localStorage.setItem('user', JSON.stringify(demoUser));
            setUser(demoUser);
            resolve();
            return;
          }
          
          // Check if the user exists in verified users
          const userFound = storedUsers.find((u: User) => u.email === email);
          
          if (userFound) {
            if (!userFound.emailVerified) {
              reject(new Error('Please verify your email before logging in'));
              return;
            }
            
            // In a real app, we would check the password hash
            if (password.length >= 6) {
              localStorage.setItem('user', JSON.stringify(userFound));
              setUser(userFound);
              resolve();
            } else {
              reject(new Error('Invalid password'));
            }
          } else {
            // Check if user is pending verification
            const pendingUser = pendingUsers.find((u: any) => u.email === email);
            if (pendingUser) {
              reject(new Error('Please verify your email before logging in'));
            } else {
              reject(new Error('User not found'));
            }
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
          // Check if user already exists
          const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          
          if (storedUsers.some((u: User) => u.email === email) || 
              pendingUsers.some((u: any) => u.email === email)) {
            reject(new Error('User with this email already exists'));
            return;
          }
          
          // In a real app, this would be handled by the backend
          const newUser = { 
            email, 
            name,
            emailVerified: false,
            verificationToken: Math.random().toString(36).substring(2, 15)
          };
          
          // Store in pending users
          pendingUsers.push(newUser);
          localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
          
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  // Verify email function
  const verifyEmail = async (token: string): Promise<void> => {
    setIsLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          
          const userIndex = pendingUsers.findIndex((u: any) => u.verificationToken === token);
          
          if (userIndex >= 0) {
            const verifiedUser = {
              ...pendingUsers[userIndex],
              emailVerified: true
            };
            
            // Remove verification token
            delete verifiedUser.verificationToken;
            
            // Add to verified users
            storedUsers.push(verifiedUser);
            localStorage.setItem('users', JSON.stringify(storedUsers));
            
            // Remove from pending users
            pendingUsers.splice(userIndex, 1);
            localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
            
            toast.success("Email verified successfully", {
              description: "You can now log in to your account"
            });
            
            resolve();
          } else {
            reject(new Error('Invalid or expired verification token'));
          }
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  // Resend verification email
  const resendVerification = async (email: string): Promise<void> => {
    setIsLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
          const userIndex = pendingUsers.findIndex((u: any) => u.email === email);
          
          if (userIndex >= 0) {
            // Generate new verification token
            pendingUsers[userIndex].verificationToken = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
            
            toast.success("Verification email sent", {
              description: "Please check your inbox for the verification link"
            });
            
            resolve();
          } else {
            reject(new Error('Email not found or already verified'));
          }
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  // Update profile
  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
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
    updateProfile,
    isAuthenticated: !!user,
    isLoading,
    verifyEmail,
    resendVerification
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
