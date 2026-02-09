import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAllTestBenches } from '../../../hooks/useQueries';
import { useActor } from '../../../hooks/useActor';
import { FileIcon, Download } from 'lucide-react';
import { downloadDocument } from '../../../utils/download';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n/useI18n';
import type { Document } from '../../../backend';
import { useQuery } from '@tanstack/react-query';

export function AdminDocumentsPanel() {
  const { t } = useI18n();
  const { actor } = useActor();
  const { data: benches = [] } = useGetAllTestBenches();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['allDocuments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterDocumentsByTags([]);
    },
    enabled: !!actor,
  });

  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc);
      toast.success(t('admin.documentsDownloadSuccess').replace('{name}', doc.productDisplayName));
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.message || t('admin.documentsDownloadFailed'));
    }
  };

  const getBenchNames = (doc: Document): string => {
    const benchNames = doc.associatedBenches
      .map(benchId => benches.find(b => b.id === benchId)?.name)
      .filter(Boolean);
    return benchNames.length > 0 ? benchNames.join(', ') : 'No benches';
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
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-muted rounded"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {doc.productDisplayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category}
                      {doc.documentVersion && ` • v${doc.documentVersion}`}
                      {' • '}
                      {getBenchNames(doc)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
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
