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
import { useGetAllDocuments } from '../../../hooks/useQueries';
import { Download, Loader2, FileText } from 'lucide-react';
import { downloadDocument } from '../../../utils/download';
import { toast } from 'sonner';

export function AdminDocumentsPanel() {
  const { data: allDocuments = [], isLoading } = useGetAllDocuments();

  const handleDownload = async (doc: any, benchName: string) => {
    try {
      await downloadDocument(doc.document.fileReference, doc.document.productDisplayName);
      toast.success(`Downloaded ${doc.document.productDisplayName}`);
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.message || 'Failed to download document');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Management
          </CardTitle>
          <CardDescription>View and download all documents in the system</CardDescription>
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
          <FileText className="h-5 w-5" />
          Document Management
        </CardTitle>
        <CardDescription>View and download all documents in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {allDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No documents available</p>
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
                      onClick={() => handleDownload(doc, doc.benchName)}
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
}
