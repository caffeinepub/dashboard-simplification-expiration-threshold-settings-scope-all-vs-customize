import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useGetTestBench,
  useRemoveTestBench,
  useGetCallerUserProfile,
  useGetBenchComponents,
  useSetBenchComponents,
  useGetBenchHistory,
} from '../../hooks/useQueries';
import { getEffectiveThreshold } from '../../utils/expirationSettings';
import { ExternalLink, TestTube2, AlertCircle, FileText, Activity, Tags, Trash2, Loader2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { BenchComponentsTableEditor } from './components/BenchComponentsTableEditor';
import { BenchDocumentsEditor } from './components/BenchDocumentsEditor';
import { BenchHistoryList } from './components/BenchHistoryList';
import { EditBenchModal } from './components/EditBenchModal';
import { BenchPhoto } from './components/BenchPhoto';
import { DuplicateComponentDialog } from './components/DuplicateComponentDialog';
import type { Component } from '../../backend';

export default function BenchDetailPage() {
  const { benchId } = useParams({ from: '/benches/$benchId' });
  const navigate = useNavigate();
  const { data: bench, isLoading } = useGetTestBench(benchId);
  const { data: profile } = useGetCallerUserProfile();
  const { data: components = [] } = useGetBenchComponents(benchId);
  const { data: history = [] } = useGetBenchHistory(benchId);
  const removeBench = useRemoveTestBench();
  const setComponents = useSetBenchComponents();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedComponentForDuplication, setSelectedComponentForDuplication] = useState<Component | null>(null);
  const [localComponents, setLocalComponents] = useState<Component[]>([]);
  const [isSavingComponents, setIsSavingComponents] = useState(false);

  const effectiveThreshold = getEffectiveThreshold(profile ?? null, benchId);

  const handleRemoveBench = async () => {
    try {
      await removeBench.mutateAsync(benchId);
      toast.success('Test bench removed successfully');
      navigate({ to: '/benches' });
    } catch (error: any) {
      console.error('Failed to remove bench:', error);
      toast.error(error.message || 'Failed to remove bench');
    }
  };

  const handleSaveComponents = async () => {
    setIsSavingComponents(true);
    try {
      await setComponents.mutateAsync({ benchId, components: localComponents });
      toast.success('Components saved successfully');
    } catch (error: any) {
      console.error('Failed to save components:', error);
      toast.error(error.message || 'Failed to save components');
    } finally {
      setIsSavingComponents(false);
    }
  };

  const handleDuplicateComponent = (component: Component) => {
    setSelectedComponentForDuplication(component);
    setDuplicateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test bench...</p>
        </div>
      </div>
    );
  }

  if (!bench) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Test Bench Not Found</AlertTitle>
          <AlertDescription>
            The requested test bench could not be found. It may have been removed or the ID is incorrect.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube2 className="h-8 w-8" />
            {bench.name}
          </h1>
          {bench.agileCode && (
            <p className="text-muted-foreground mt-1">AGILE Code: {bench.agileCode}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditModalOpen(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Bench
          </Button>
          {bench.plmAgileUrl && (
            <Button variant="outline" asChild>
              <a href={bench.plmAgileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in PLM Agile
              </a>
            </Button>
          )}
          {bench.decawebUrl && (
            <Button variant="outline" asChild>
              <a href={bench.decawebUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Decaweb
              </a>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Bench
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the test bench
                  "{bench.name}" and all associated documents and data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveBench}
                  disabled={removeBench.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {removeBench.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Bench
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bench Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
            <BenchPhoto
              photo={bench.photo}
              alt={bench.name}
              className="w-full h-full"
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{bench.description || 'No description available'}</p>
          </div>
          {bench.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {bench.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag.tagName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health">Health Book</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Health Book</CardTitle>
              <CardDescription>
                Track component validity and expiration dates (threshold: {effectiveThreshold} days)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BenchComponentsTableEditor
                components={localComponents.length > 0 ? localComponents : components}
                onChange={setLocalComponents}
                effectiveThreshold={effectiveThreshold}
                benchId={benchId}
                onDuplicateComponent={handleDuplicateComponent}
              />
              {localComponents.length > 0 && (
                <Button onClick={handleSaveComponents} disabled={isSavingComponents} className="w-full">
                  {isSavingComponents && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Components
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <BenchDocumentsEditor benchId={benchId} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Change History
              </CardTitle>
              <CardDescription>
                Complete audit trail of modifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BenchHistoryList history={history} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {bench && <EditBenchModal open={editModalOpen} onOpenChange={setEditModalOpen} bench={bench} />}
      <DuplicateComponentDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        component={selectedComponentForDuplication}
        currentBenchId={benchId}
      />
    </div>
  );
}
