
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlocks in the auth state listener
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Login successful", {
        description: "Welcome back to AI Study Planner!",
      });
      
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Login failed", {
          description: error.message || "Invalid email or password. Please try again.",
        });
      } else {
        toast.error("Login failed", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Account created successfully", {
        description: "Please check your email for confirmation.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Signup failed", {
          description: error.message || "Unable to create account. Please try again.",
        });
      } else {
        toast.error("Signup failed", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email function
  const verifyEmail = async (token: string): Promise<void> => {
    setIsLoading(true);
    // In Supabase, email verification is handled automatically
    // This function is kept for API compatibility but it's not needed with Supabase
    try {
      // Just resolve as this is handled by Supabase
      toast.success("Email verified successfully", {
        description: "You can now log in to your account"
      });
      navigate('/auth');
    } catch (error) {
      toast.error("Verification failed", {
        description: "Invalid or expired verification token."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email
  const resendVerification = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Verification email sent", {
        description: "Please check your inbox for the verification link"
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to resend verification", {
          description: error.message
        });
      } else {
        toast.error("Failed to resend verification", {
          description: "An unexpected error occurred"
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast.success("Profile updated", {
        description: "Your profile information has been saved"
      });
    } catch (error) {
      toast.error("Failed to update profile", {
        description: "Please try again later"
      });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      navigate('/auth');
    } catch (error) {
      toast.error("Logout failed", {
        description: "Please try again"
      });
    }
  };

  const value = {
    user,
    profile,
    session,
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
