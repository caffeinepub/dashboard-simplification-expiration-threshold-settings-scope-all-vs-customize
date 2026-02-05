import { useEffect } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

const HEARTBEAT_INTERVAL = 60000; // 1 minute

export function useLastSeenHeartbeat() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    if (!actor || !identity) {
      return;
    }

    const updateLastSeen = async () => {
      try {
        await actor.updateLastSeen();
      } catch (error) {
        console.error('Failed to update last seen:', error);
      }
    };

    // Update immediately
    updateLastSeen();

    // Set up interval
    const intervalId = setInterval(updateLastSeen, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [actor, identity]);
}
