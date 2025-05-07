import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { UserCheck, UserPlus, Eye, EyeOff, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, resendVerification } = useAuth();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    
    try {
      await login(loginEmail, loginPassword);
      
      toast.success("Login successful", {
        description: "Welcome back to AI Study Planner!",
      });
      
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
        
        // Check if it's a verification error
        if (error.message.includes('verify')) {
          toast.error("Email not verified", {
            description: "Please check your inbox for verification email or request a new one.",
          });
        } else {
          toast.error("Login failed", {
            description: error.message || "Invalid email or password. Please try again.",
          });
        }
      } else {
        toast.error("Login failed", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signup(signupName, signupEmail, signupPassword);
      
      // Set email sent flag to show confirmation message
      setEmailSent(true);
      
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
      toast.success("Verification email sent", {
        description: "Please check your inbox for the verification link",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to resend verification", {
          description: error.message,
        });
      } else {
        toast.error("Failed to resend verification", {
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setResendingVerification(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    
    try {
      await login('demo@example.com', 'password');
      
      toast.success("Demo login successful", {
        description: "You're using the demo account",
      });
      
      navigate('/');
    } catch (error) {
      toast.error("Demo login failed", {
        description: "Unable to access demo account",
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
                    <Alert variant="default" className="bg-amber-50 border-amber-200">
                      <AlertDescription className="flex justify-between items-center">
                        <span>Please verify your email before logging in.</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleResendVerification}
                          disabled={resendingVerification}
                          className="ml-2 bg-amber-50"
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
                      <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Back to signup
                  </Button>
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
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
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
