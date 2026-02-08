import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAllDocuments } from '../../../hooks/useQueries';
import { FileIcon, Download } from 'lucide-react';
import { downloadDocument } from '../../../utils/download';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n/useI18n';

export function AdminDocumentsPanel() {
  const { t } = useI18n();
  const { data: documents = [], isLoading } = useGetAllDocuments();

  const handleDownload = async (doc: any) => {
    try {
      await downloadDocument(doc.document.fileReference, doc.document.productDisplayName);
      toast.success(t('admin.documentsDownloadSuccess').replace('{name}', doc.document.productDisplayName));
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.message || t('admin.documentsDownloadFailed'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('admin.documentsLoading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.documentsTitle')}</CardTitle>
        <CardDescription>
          {t('admin.documentsDescription').replace('{count}', documents.length.toString())}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('admin.documentsEmpty')}</p>
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
