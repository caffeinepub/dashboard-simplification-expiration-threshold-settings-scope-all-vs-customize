import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { normalizeErrorMessage } from '../utils/errors';
import { useEffect } from 'react';

export default function SignInPage() {
  const { login, loginStatus, loginError, identity } = useInternetIdentity();
  const { t } = useI18n();

  const isLoggingIn = loginStatus === 'logging-in';

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (identity) {
      window.location.href = '/';
    }
  }, [identity]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src="/assets/generated/safran-logo.dim_220x64.png"
            alt="Safran"
            className="h-6 w-auto mx-auto mb-4 object-contain"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <CardTitle className="text-2xl">{t('auth.welcome')}</CardTitle>
          <CardDescription>
            {t('auth.systemDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{normalizeErrorMessage(loginError)}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {t('auth.signInHelper')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
