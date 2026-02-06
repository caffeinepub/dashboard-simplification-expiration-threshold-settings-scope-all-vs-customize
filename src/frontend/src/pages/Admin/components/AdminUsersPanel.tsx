import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCallerUserProfile } from '../../../hooks/useQueries';
import { User } from 'lucide-react';

export function AdminUsersPanel() {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-8">No profile found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile Information</CardTitle>
        <CardDescription>Current user profile details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded">
            <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Entity: {profile.entity}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Expiration Preferences</h4>
            <div className="p-3 bg-muted rounded text-sm">
              <p>
                Mode:{' '}
                {profile.expirationThresholdMode === 'allBenches'
                  ? 'All Benches'
                  : 'Customized Benches'}
              </p>
              <p>Global Threshold: {Number(profile.thresholdAllBenches)} days</p>
              {profile.thresholdCustomizedBenches.length > 0 && (
                <p className="mt-1">
                  Custom Thresholds: {profile.thresholdCustomizedBenches.length} bench(es)
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Dashboard Layout</h4>
            <div className="p-3 bg-muted rounded text-sm">
              <p>{profile.dashboardSectionsOrdered.length} sections configured</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
