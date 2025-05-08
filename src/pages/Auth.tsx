
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { UserCheck, UserPlus, Eye, EyeOff, Mail, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, resendVerification, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    
    try {
      await login(loginEmail, loginPassword);
      // Navigate happens in the login function after success
    } catch (error) {
      setIsLoading(false);
      // Error toast is shown in the login function
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signup(signupName, signupEmail, signupPassword);
      // Set email sent flag to show confirmation message
      setEmailSent(true);
    } catch (error) {
      // Error toast is shown in the signup function
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!loginEmail) {
      toast.error("Email required", {
        description: "Please enter your email address to resend verification",
      });
      return;
    }
    
    setResendingVerification(true);
    
    try {
      await resendVerification(loginEmail);
    } catch (error) {
      // Error toast is shown in the resendVerification function
    } finally {
      setResendingVerification(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    
    try {
      await login('demo@example.com', 'password123');
    } catch (error) {
      toast.error("Demo login failed", {
        description: "Unable to access demo account. Please create a new account instead.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginPasswordVisibility = () => setShowLoginPassword(prev => !prev);
  const toggleSignupPasswordVisibility = () => setShowSignupPassword(prev => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">AI Study Planner</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your personalized study plan</p>
        </div>
        
        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loginError && loginError.includes('verify') && (
                    <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                      <AlertDescription className="flex justify-between items-center">
                        <span>Please verify your email before logging in.</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleResendVerification}
                          disabled={resendingVerification}
                          className="ml-2 bg-amber-50 dark:bg-amber-900/30"
                        >
                          {resendingVerification ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : null}
                          Resend
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">Email</label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium" htmlFor="password">Password</label>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-sm"
                        onClick={async () => {
                          if (loginEmail) {
                            try {
                              const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
                                redirectTo: `${window.location.origin}/auth?reset=true`,
                              });
                              if (error) throw error;
                              toast.success("Password reset email sent", {
                                description: "Check your inbox for instructions"
                              });
                            } catch (error) {
                              toast.error("Failed to send reset email", {
                                description: "Please try again"
                              });
                            }
                          } else {
                            toast.error("Email required", {
                              description: "Please enter your email first"
                            });
                          }
                        }}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={toggleLoginPasswordVisibility}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full" 
                    onClick={demoLogin}
                    disabled={isLoading}
                  >
                    Try Demo Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {emailSent ? (
                <div className="p-6 text-center">
                  <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                  <CardTitle className="mb-2">Check your email!</CardTitle>
                  <CardDescription className="mb-6">
                    We've sent a confirmation email to <strong>{signupEmail}</strong>. 
                    Please check your inbox and confirm your email address to continue.
                  </CardDescription>
                  <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <Info className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      Note: For development purposes, you may want to disable email verification in the Supabase dashboard.
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setEmailSent(false)}
                    >
                      Back to signup
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={demoLogin}
                    >
                      Try Demo Account
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSignup}>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Enter your details to create a new account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="signup-email">Email</label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="signup-password">Password</label>
                      <div className="relative">
                        <Input 
                          id="signup-password" 
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={toggleSignupPasswordVisibility}
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 6 characters
                      </p>
                    </div>
                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                      <Info className="h-4 w-4 mr-2" />
                      <AlertDescription>
                        This app uses Supabase for authentication and data storage.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full" 
                      onClick={demoLogin}
                    >
                      Try Demo Account
                    </Button>
                  </CardFooter>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
