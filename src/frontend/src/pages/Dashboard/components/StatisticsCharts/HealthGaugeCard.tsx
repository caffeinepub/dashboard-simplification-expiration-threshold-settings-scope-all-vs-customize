import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';

interface HealthGaugeCardProps {
  data: Array<{ benchId: string; benchName: string; components: any[] }>;
}

export function HealthGaugeCard({ data }: HealthGaugeCardProps) {
  const allComponents = data.flatMap((bench) => bench.components);
  const totalComponents = allComponents.length;

  if (totalComponents === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall Health
          </CardTitle>
          <CardDescription>System-wide component health status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No components to analyze
          </p>
        </CardContent>
      </Card>
    );
  }

  const expiredCount = allComponents.filter((c) => c.status === 'expired').length;
  const expiringSoonCount = allComponents.filter((c) => c.status === 'expiringSoon').length;
  const okCount = allComponents.filter((c) => c.status === 'ok').length;

  const expiredPercent = Math.round((expiredCount / totalComponents) * 100);
  const expiringSoonPercent = Math.round((expiringSoonCount / totalComponents) * 100);
  const okPercent = Math.round((okCount / totalComponents) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Overall Health
        </CardTitle>
        <CardDescription>System-wide component health status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">OK</span>
            <span className="text-muted-foreground">
              {okCount} ({okPercent}%)
            </span>
          </div>
          <Progress value={okPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-orange-500">Expiring Soon</span>
            <span className="text-muted-foreground">
              {expiringSoonCount} ({expiringSoonPercent}%)
            </span>
          </div>
          <Progress value={expiringSoonPercent} className="h-2 [&>div]:bg-orange-500" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-destructive">Expired</span>
            <span className="text-muted-foreground">
              {expiredCount} ({expiredPercent}%)
            </span>
          </div>
          <Progress value={expiredPercent} className="h-2 [&>div]:bg-destructive" />
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Components</span>
            <span className="text-2xl font-bold">{totalComponents}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
