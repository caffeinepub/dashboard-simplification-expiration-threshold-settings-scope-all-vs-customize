import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const { login, loginStatus, loginError } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src="/assets/generated/safran-logo.dim_220x64.png"
            alt="Safran"
            className="h-10 w-auto mx-auto mb-4"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <CardTitle className="text-2xl">Welcome to HistoryBench</CardTitle>
          <CardDescription>
            Comprehensive test bench management and traceability system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError.message}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Sign in to access test bench records, component health tracking, and document management
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
