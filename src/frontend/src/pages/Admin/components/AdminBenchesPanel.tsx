import { useState } from 'react';
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
import { useGetAllTestBenches, useRemoveTestBench } from '../../../hooks/useQueries';
import { Trash2, Loader2, TestTube2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminBenchesPanel() {
  const { data: benches = [], isLoading } = useGetAllTestBenches();
  const removeBench = useRemoveTestBench();
  const [deletingBenchId, setDeletingBenchId] = useState<string | null>(null);

  const handleDelete = async (benchId: string, benchName: string) => {
    setDeletingBenchId(benchId);
    try {
      await removeBench.mutateAsync(benchId);
      toast.success(`Bench "${benchName}" deleted successfully`);
    } catch (error: any) {
      console.error('Failed to delete bench:', error);
      toast.error(error.message || 'Failed to delete bench');
    } finally {
      setDeletingBenchId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            Bench Management
          </CardTitle>
          <CardDescription>Manage all test benches in the system</CardDescription>
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
          <TestTube2 className="h-5 w-5" />
          Bench Management
        </CardTitle>
        <CardDescription>Manage all test benches in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {benches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No benches available</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>AGILE Code</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benches.map((bench) => (
                <TableRow key={bench.id}>
                  <TableCell className="font-medium">{bench.name}</TableCell>
                  <TableCell>{bench.agileCode || '—'}</TableCell>
                  <TableCell>{bench.tags.length} tag(s)</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingBenchId === bench.id}
                        >
                          {deletingBenchId === bench.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Bench</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{bench.name}"? This action cannot be
                            undone and will remove all associated documents and data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(bench.id, bench.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
