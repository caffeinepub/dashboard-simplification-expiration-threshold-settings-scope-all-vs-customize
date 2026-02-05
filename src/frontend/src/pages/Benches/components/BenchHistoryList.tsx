import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, User, Clock } from 'lucide-react';
import type { HistoryEntry } from '../../../backend';

interface BenchHistoryListProps {
  history: HistoryEntry[];
}

export function BenchHistoryList({ history }: BenchHistoryListProps) {
  const sortedHistory = [...history].sort((a, b) => Number(b.timestamp - a.timestamp));

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  };

  if (sortedHistory.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No history available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedHistory.map((entry, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {entry.action}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(entry.timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {formatPrincipal(entry.user.toString())}
              </span>
            </CardDescription>
          </CardHeader>
          {entry.details && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{entry.details}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
