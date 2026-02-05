import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile } from '../../../hooks/useQueries';
import { Users, Loader2 } from 'lucide-react';
import { ExpirationThresholdMode } from '../../../backend';

export function AdminUsersPanel() {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>View user profiles and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>View user profiles and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        {!profile ? (
          <p className="text-sm text-muted-foreground text-center py-8">No user data available</p>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Current User Profile</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Name</TableCell>
                    <TableCell>{profile.name || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell>{profile.email || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">User ID</TableCell>
                    <TableCell className="font-mono text-xs">{profile.userId}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Expiration Preferences</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Mode</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {profile.expirationThresholdMode === ExpirationThresholdMode.allBenches
                          ? 'All Benches'
                          : 'Customized Benches'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Global Threshold</TableCell>
                    <TableCell>{profile.thresholdAllBenches.toString()} days</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Custom Thresholds</TableCell>
                    <TableCell>
                      {profile.thresholdCustomizedBenches.length} bench(es) customized
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Dashboard Layout</h3>
              <div className="space-y-2">
                {profile.dashboardSectionsOrdered.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-1">
                    {profile.dashboardSectionsOrdered.map((section, idx) => (
                      <li key={idx} className="text-sm">
                        {section}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">Default layout</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
