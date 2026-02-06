import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCallerUserProfile } from '../../../hooks/useQueries';
import { User } from 'lucide-react';
import { useI18n } from '../../../i18n/useI18n';

export function AdminUsersPanel() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('admin.loadingProfile')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-8">{t('admin.noProfile')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.userProfile')}</CardTitle>
        <CardDescription>{t('admin.userProfileDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded">
            <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{profile.username || profile.userId}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('admin.entity')} {profile.entity}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('admin.expirationPreferences')}</h4>
            <div className="p-3 bg-muted rounded text-sm">
              <p>
                {t('admin.mode')}{' '}
                {profile.expirationThresholdMode === 'allBenches'
                  ? t('admin.allBenches')
                  : t('admin.customizedBenches')}
              </p>
              <p>{t('admin.globalThreshold')} {Number(profile.thresholdAllBenches)} {t('admin.days')}</p>
              {profile.thresholdCustomizedBenches.length > 0 && (
                <p className="mt-1">
                  {t('admin.customThresholds')} {profile.thresholdCustomizedBenches.length} {t('admin.benchesConfigured')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('admin.dashboardLayout')}</h4>
            <div className="p-3 bg-muted rounded text-sm">
              <p>{profile.dashboardSectionsOrdered.length} {t('admin.sectionsConfigured')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
