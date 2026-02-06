import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock } from 'lucide-react';
import type { HistoryEntry } from '../../../backend';
import { UserAvatar } from '../../../components/profile/UserAvatar';
import { useGetPublicUserInfo } from '../../../hooks/useQueries';
import { useI18n } from '../../../i18n/useI18n';

interface BenchHistoryListProps {
  history: HistoryEntry[];
}

function HistoryEntryCard({ entry }: { entry: HistoryEntry }) {
  const { data: userInfo } = useGetPublicUserInfo(entry.user);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  };

  return (
    <Card>
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
          <span className="flex items-center gap-2">
            {userInfo ? (
              <>
                <UserAvatar
                  profilePicture={userInfo.profilePicture}
                  name={userInfo.username}
                  size="sm"
                  className="h-6 w-6"
                />
                <span>{userInfo.username || formatPrincipal(entry.user.toString())}</span>
              </>
            ) : (
              <span>{formatPrincipal(entry.user.toString())}</span>
            )}
          </span>
        </CardDescription>
      </CardHeader>
      {entry.details && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{entry.details}</p>
        </CardContent>
      )}
    </Card>
  );
}

export function BenchHistoryList({ history }: BenchHistoryListProps) {
  const { t } = useI18n();
  const sortedHistory = [...history].sort((a, b) => Number(b.timestamp - a.timestamp));

  if (sortedHistory.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t('benches.noHistory')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedHistory.map((entry, index) => (
        <HistoryEntryCard key={index} entry={entry} />
      ))}
    </div>
  );
}
