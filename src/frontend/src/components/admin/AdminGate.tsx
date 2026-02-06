import { ReactNode } from 'react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have administrator privileges to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
