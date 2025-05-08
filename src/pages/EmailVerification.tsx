
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const EmailVerification: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleVerification = async () => {
      // Check if redirected from password reset
      const resetPassword = searchParams.get('type') === 'recovery';
      
      if (resetPassword) {
        // This is a password reset
        setIsVerifying(false);
        setVerificationSuccess(true);
        return;
      }
      
      // For email verification, Supabase handles this automatically
      // We can just check the hash to see if it contains an access_token
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // There was a token, assume verification was successful
          setVerificationSuccess(true);
        } else {
          // No token found
          setError("No verification token found. The link might be invalid or expired.");
        }
      } catch (error) {
        setError("Verification failed. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    };
    
    handleVerification();
  }, [searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>
              Confirming your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center py-6">
            {isVerifying ? (
              <>
                <RefreshCw className="h-16 w-16 text-primary animate-spin mb-4" />
                <p>Verifying your email address...</p>
              </>
            ) : verificationSuccess ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verification Successful!</h2>
                <p className="text-center text-muted-foreground mb-4">
                  Your email has been verified successfully. You can now log in to your account.
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
                <p className="text-center text-muted-foreground mb-4">
                  {error || "Something went wrong during verification."}
                </p>
              </>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              {verificationSuccess ? "Proceed to Login" : "Back to Login"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
