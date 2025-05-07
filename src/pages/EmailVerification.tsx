
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const { verifyEmail } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      setError("Invalid verification link. No token provided.");
      setIsVerifying(false);
      return;
    }
    
    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setVerificationSuccess(true);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Verification failed. Please try again.");
        }
      } finally {
        setIsVerifying(false);
      }
    };
    
    handleVerification();
  }, [location.search, verifyEmail]);
  
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
