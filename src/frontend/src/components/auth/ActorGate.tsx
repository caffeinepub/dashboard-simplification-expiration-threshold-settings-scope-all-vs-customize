import { type ReactNode } from 'react';
import { useActor } from '../../hooks/useActor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ActorGateProps {
  children: ReactNode;
}

export default function ActorGate({ children }: ActorGateProps) {
  const { actor, isFetching } = useActor();

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing backend connection...</p>
        </div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the backend. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
