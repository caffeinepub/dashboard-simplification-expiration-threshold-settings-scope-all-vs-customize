import { type ReactNode, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, isInitializing, login, loginStatus } = useInternetIdentity();

  // Redirect to sign-in page if not authenticated
  useEffect(() => {
    if (!isInitializing && !identity && window.location.pathname !== '/sign-in') {
      window.location.href = '/sign-in';
    }
  }, [identity, isInitializing]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    const isLoggingIn = loginStatus === 'logging-in';
    
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>You must be signed in to access this page.</p>
            <div className="flex gap-2">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                variant="default"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                onClick={() => window.location.href = '/sign-in'}
                variant="outline"
              >
                Go to Sign In Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
