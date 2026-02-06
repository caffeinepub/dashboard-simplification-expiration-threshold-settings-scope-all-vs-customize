import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getEffectiveThreshold, computeExpirationStatus } from '../../../../utils/expirationSettings';
import type { UserProfile } from '../../../../backend';
import { useI18n } from '../../../../i18n/useI18n';

interface HealthGaugeCardProps {
  data: Array<{ benchId: string; benchName: string; agileCode: string; serialNumber: string; components: any[] }>;
  profile: UserProfile | null;
}

export function HealthGaugeCard({ data, profile }: HealthGaugeCardProps) {
  const { t } = useI18n();
  const statusCounts = { ok: 0, expiringSoon: 0, expired: 0 };

  data.forEach((benchData) => {
    const threshold = getEffectiveThreshold(profile, benchData.benchId);
    benchData.components.forEach((comp) => {
      const status = computeExpirationStatus(comp.expirationDate, threshold);
      statusCounts[status]++;
    });
  });

  const total = statusCounts.ok + statusCounts.expiringSoon + statusCounts.expired;
  const okPercent = total > 0 ? (statusCounts.ok / total) * 100 : 0;
  const expiringSoonPercent = total > 0 ? (statusCounts.expiringSoon / total) * 100 : 0;
  const expiredPercent = total > 0 ? (statusCounts.expired / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('charts.healthGauge')}
        </CardTitle>
        <CardDescription>{t('charts.healthGaugeDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('charts.noComponents')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('charts.ok')}</span>
                <span className="font-medium">{okPercent.toFixed(1)}%</span>
              </div>
              <Progress value={okPercent} className="h-2" style={{ '--progress-background': 'oklch(0.65 0.15 150)' } as any} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('charts.expiringSoon')}</span>
                <span className="font-medium">{expiringSoonPercent.toFixed(1)}%</span>
              </div>
              <Progress value={expiringSoonPercent} className="h-2" style={{ '--progress-background': 'oklch(0.70 0.15 50)' } as any} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('charts.expired')}</span>
                <span className="font-medium">{expiredPercent.toFixed(1)}%</span>
              </div>
              <Progress value={expiredPercent} className="h-2" style={{ '--progress-background': 'oklch(0.60 0.15 25)' } as any} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
