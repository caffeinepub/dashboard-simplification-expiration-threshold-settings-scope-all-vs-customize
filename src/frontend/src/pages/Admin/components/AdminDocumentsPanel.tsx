import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAllDocuments } from '../../../hooks/useQueries';
import { FileIcon, Download } from 'lucide-react';
import { downloadDocument } from '../../../utils/download';
import { toast } from 'sonner';

export function AdminDocumentsPanel() {
  const { data: documents = [], isLoading } = useGetAllDocuments();

  const handleDownload = async (doc: any) => {
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
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Management</CardTitle>
        <CardDescription>
          View and download all documents ({documents.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No documents found</p>
        ) : (
          <div className="space-y-2">
            {documents.map((item) => (
              <div
                key={item.document.id}
                className="flex items-center justify-between p-3 bg-muted rounded"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.document.productDisplayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.document.category}
                      {item.document.documentVersion && ` • v${item.document.documentVersion}`}
                      {' • '}
                      {item.benchName}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
