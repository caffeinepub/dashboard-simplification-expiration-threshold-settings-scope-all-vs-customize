import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllTestBenches, useGetCallerUserProfile, useGetAllBenchComponents, useGetAllDocuments, useUpdateDashboardSectionsOrder } from '../hooks/useQueries';
import { getEffectiveThreshold, computeExpirationStatus } from '../utils/expirationSettings';
import { TestTube2, FileText, Activity, TrendingUp, Plus, AlertTriangle, Download, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { downloadDocument } from '../utils/download';
import { toast } from 'sonner';

const DEFAULT_SECTIONS = ['statistics', 'criticalComponents', 'expiringComponents', 'documents', 'quickActions'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: benches = [], isLoading } = useGetAllTestBenches();
  const { data: profile } = useGetCallerUserProfile();
  const { data: allBenchComponents = [] } = useGetAllBenchComponents();
  const { data: allDocuments = [] } = useGetAllDocuments();
  const updateSectionsOrder = useUpdateDashboardSectionsOrder();

  const [isReordering, setIsReordering] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    if (profile?.dashboardSectionsOrdered && profile.dashboardSectionsOrdered.length > 0) {
      setSectionOrder(profile.dashboardSectionsOrdered);
    } else {
      setSectionOrder(DEFAULT_SECTIONS);
    }
  }, [profile]);

  const totalBenches = benches.length;

  const componentsWithStatus = allBenchComponents.flatMap((benchData) =>
    benchData.components.map((comp) => {
      const threshold = getEffectiveThreshold(profile ?? null, benchData.benchId);
      const status = computeExpirationStatus(comp.expirationDate, threshold);
      return {
        componentName: comp.componentName,
        benchName: benchData.benchName,
        agileCode: benchData.agileCode,
        status,
      };
    })
  );

  const criticalComponents = componentsWithStatus.filter((c) => c.status === 'expired');
  const expiringSoonComponents = componentsWithStatus.filter((c) => c.status === 'expiringSoon');

  const handleDownload = async (doc: any) => {
    try {
      await downloadDocument(doc.document.fileReference, doc.document.productDisplayName);
      toast.success(`Downloaded ${doc.document.productDisplayName}`);
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.message || 'Failed to download document');
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const handleSaveOrder = async () => {
    try {
      await updateSectionsOrder.mutateAsync(sectionOrder);
      toast.success('Dashboard layout saved');
      setIsReordering(false);
    } catch (error: any) {
      console.error('Failed to save layout:', error);
      toast.error(error.message || 'Failed to save layout');
    }
  };

  const renderSection = (sectionId: string, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;

    const reorderControls = isReordering && (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moveSection(index, 'up')}
          disabled={!canMoveUp}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moveSection(index, 'down')}
          disabled={!canMoveDown}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    );

    switch (sectionId) {
      case 'statistics':
        return (
          <div key={sectionId} className="space-y-4">
            {isReordering && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Statistics</h2>
                {reorderControls}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Test Benches</CardTitle>
                  <TestTube2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBenches}</div>
                  <p className="text-xs text-muted-foreground">Active test benches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Components</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{criticalComponents.length}</div>
                  <p className="text-xs text-muted-foreground">Expired components</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{expiringSoonComponents.length}</div>
                  <p className="text-xs text-muted-foreground">Based on your threshold settings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allDocuments.length}</div>
                  <p className="text-xs text-muted-foreground">Total documents</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'criticalComponents':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Critical Components
                  </CardTitle>
                  <CardDescription>Components that have expired</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent>
              {criticalComponents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No critical components</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment Name</TableHead>
                      <TableHead>Bench</TableHead>
                      <TableHead>AGILE Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalComponents.map((comp, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{comp.componentName}</TableCell>
                        <TableCell>{comp.benchName}</TableCell>
                        <TableCell>{comp.agileCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case 'expiringComponents':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Expiring Soon
                  </CardTitle>
                  <CardDescription>Components approaching expiration</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent>
              {expiringSoonComponents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No components expiring soon</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment Name</TableHead>
                      <TableHead>Bench</TableHead>
                      <TableHead>AGILE Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringSoonComponents.map((comp, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{comp.componentName}</TableCell>
                        <TableCell>{comp.benchName}</TableCell>
                        <TableCell>{comp.agileCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case 'documents':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                  <CardDescription>All documents across test benches</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent>
              {allDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Bench</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allDocuments.map((doc, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{doc.document.productDisplayName}</TableCell>
                        <TableCell>{doc.document.category}</TableCell>
                        <TableCell>{doc.document.documentVersion || '—'}</TableCell>
                        <TableCell>{doc.benchName}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case 'quickActions':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and navigation</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={() => navigate({ to: '/benches/new' })}>
                <Plus className="h-4 w-4 mr-2" />
                New Bench +
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/benches' })}>
                <TestTube2 className="h-4 w-4 mr-2" />
                View All Test Benches
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/profile' })}>
                Manage Preferences
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Maintenance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of test bench health and preventive maintenance status
          </p>
        </div>
        <div className="flex gap-2">
          {isReordering ? (
            <>
              <Button variant="outline" onClick={() => setIsReordering(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOrder} disabled={updateSectionsOrder.isPending}>
                Save Layout
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsReordering(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Reorder Layout
            </Button>
          )}
        </div>
      </div>

      {sectionOrder.map((sectionId, index) => renderSection(sectionId, index))}
    </div>
  );
}
