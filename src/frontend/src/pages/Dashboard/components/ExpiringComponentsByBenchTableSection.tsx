import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useI18n } from '../../../i18n/useI18n';
import { getEffectiveThreshold, computeExpirationStatus } from '../../../utils/expirationSettings';
import type { Component, TestBench, UserProfile } from '../../../backend';

interface ExpiringComponentsByBenchTableSectionProps {
  benches: TestBench[];
  allComponents: Component[];
  profile: UserProfile | null;
}

type ComponentWithComputedStatus = Component & {
  computedStatus: 'ok' | 'expiringSoon' | 'expired';
};

export function ExpiringComponentsByBenchTableSection({
  benches,
  allComponents,
  profile,
}: ExpiringComponentsByBenchTableSectionProps) {
  const { t } = useI18n();

  // Compute status for each component using the same logic as charts
  const componentsWithStatus: ComponentWithComputedStatus[] = allComponents.map((component) => {
    const threshold = getEffectiveThreshold(profile, component.associatedBenchId);
    const computedStatus = computeExpirationStatus(component.expirationDate, threshold);
    return {
      ...component,
      computedStatus,
    };
  });

  // Filter only expiring soon or expired components
  const expiringOrExpiredComponents = componentsWithStatus.filter(
    (comp): comp is ComponentWithComputedStatus & { computedStatus: 'expiringSoon' | 'expired' } =>
      comp.computedStatus === 'expiringSoon' || comp.computedStatus === 'expired'
  );

  // Helper to get bench name from ID
  const getBenchName = (benchId: string): string => {
    const bench = benches.find((b) => b.id === benchId);
    return bench?.name || benchId;
  };

  // Helper to get status badge
  const getStatusBadge = (status: 'expiringSoon' | 'expired') => {
    if (status === 'expired') {
      return (
        <Badge variant="destructive" className="whitespace-nowrap">
          {t('components.expired')}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 whitespace-nowrap">
        {t('components.expiringSoon')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.expiringComponentsTableTitle')}</CardTitle>
        <CardDescription>{t('dashboard.expiringComponentsTableDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {expiringOrExpiredComponents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('dashboard.noExpiringComponents')}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.componentName')}</TableHead>
                  <TableHead>{t('dashboard.benchName')}</TableHead>
                  <TableHead>{t('dashboard.status')}</TableHead>
                  <TableHead>{t('dashboard.expirationDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringOrExpiredComponents.map((component, index) => (
                  <TableRow key={`${component.associatedBenchId}-${component.componentName}-${index}`}>
                    <TableCell className="font-medium">{component.componentName}</TableCell>
                    <TableCell>{getBenchName(component.associatedBenchId)}</TableCell>
                    <TableCell>{getStatusBadge(component.computedStatus)}</TableCell>
                    <TableCell>{component.expirationDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
