import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileIcon, MoreVertical, Download, Edit, Copy, Trash2, Loader2, Upload } from 'lucide-react';
import { useI18n } from '../../../i18n/useI18n';
import { useActor } from '../../../hooks/useActor';
import { useDeleteBenchDocument } from '../../../hooks/useQueries';
import { EditBenchDocumentDialog } from './EditBenchDocumentDialog';
import { DuplicateDocumentDialog } from './DuplicateDocumentDialog';
import { uploadFileAsBlob } from '../../../utils/blobUpload';
import { downloadDocument } from '../../../utils/download';
import { generateId } from '../../../utils/id';
import { toast } from 'sonner';
import type { Document } from '../../../backend';

interface BenchDocumentsEditorProps {
  benchId: string;
  onDocumentsChange?: () => void;
}

export function BenchDocumentsEditor({ benchId, onDocumentsChange }: BenchDocumentsEditorProps) {
  const { t } = useI18n();
  const { actor } = useActor();
  const deleteDoc = useDeleteBenchDocument();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [duplicatingDoc, setDuplicatingDoc] = useState<Document | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<Document | null>(null);
  const [isEditingHardware, setIsEditingHardware] = useState(false);
  const [isEditingSoftware, setIsEditingSoftware] = useState(false);
  const [isEditingOthers, setIsEditingOthers] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, File[]>>({});

  useEffect(() => {
    loadDocuments();
  }, [actor, benchId]);

  const loadDocuments = async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const exportData = await actor.exportData();
      const benchDocs = exportData.allDocuments.filter((doc) =>
        doc.associatedBenches.includes(benchId)
      );
      setDocuments(benchDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error(t('documents.uploadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingFiles((prev) => ({
      ...prev,
      [category]: Array.from(files),
    }));
  };

  const handleUploadDocuments = async (category: string) => {
    if (!actor) return;
    const files = uploadingFiles[category];
    if (!files || files.length === 0) return;

    try {
      for (const file of files) {
        const docId = generateId();
        setUploadProgress((prev) => ({ ...prev, [docId]: 0 }));

        const blob = await uploadFileAsBlob(file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [docId]: progress }));
        });

        await actor.createDocument(
          docId,
          file.name,
          BigInt(1),
          category,
          blob,
          '1.0.0',
          [],
          null
        );

        await actor.associateDocumentToBench(docId, benchId);

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[docId];
          return newProgress;
        });
      }

      toast.success(t('documents.uploaded'));
      await loadDocuments();
      onDocumentsChange?.();

      setUploadingFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[category];
        return newFiles;
      });
      setIsEditingHardware(false);
      setIsEditingSoftware(false);
      setIsEditingOthers(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(t('documents.uploadFailed'));
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc);
      toast.success(t('documents.downloaded'));
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(t('documents.downloadFailed'));
    }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;

    try {
      await deleteDoc.mutateAsync({
        benchId,
        documentId: deletingDoc.id,
      });
      toast.success(t('documents.deleteSuccess'));
      setDeletingDoc(null);
      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(t('documents.removeFailed'));
    }
  };

  const categorizeDocuments = () => {
    return {
      Hardware: documents.filter((d) => d.category === 'Hardware'),
      Software: documents.filter((d) => d.category === 'Software'),
      'Other(s)': documents.filter((d) => d.category === 'Other(s)'),
    };
  };

  const categorized = categorizeDocuments();
  const hasUploadProgress = Object.keys(uploadProgress).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(['Hardware', 'Software', 'Other(s)'] as const).map((category) => {
        const isEditing =
          (category === 'Hardware' && isEditingHardware) ||
          (category === 'Software' && isEditingSoftware) ||
          (category === 'Other(s)' && isEditingOthers);

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t(`documents.${category.toLowerCase()}` as any)}</CardTitle>
                  <CardDescription>
                    {categorized[category].length} {t('documents.count')}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (category === 'Hardware') setIsEditingHardware(!isEditingHardware);
                    if (category === 'Software') setIsEditingSoftware(!isEditingSoftware);
                    if (category === 'Other(s)') setIsEditingOthers(!isEditingOthers);
                  }}
                >
                  {isEditing ? t('documents.done') : t('documents.edit')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-md p-4">
                    <input
                      type="file"
                      multiple
                      id={`upload-${category}`}
                      className="hidden"
                      onChange={(e) => handleFileSelect(category, e)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById(`upload-${category}`)?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('documents.selectFile')}
                    </Button>
                    {uploadingFiles[category] && uploadingFiles[category].length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadingFiles[category].map((file, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <FileIcon className="h-4 w-4" />
                            {file.name}
                          </div>
                        ))}
                        <Button
                          onClick={() => handleUploadDocuments(category)}
                          className="w-full mt-2"
                        >
                          {t('documents.uploadDocument')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {categorized[category].length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('documents.noDocuments')}
                    </p>
                  ) : (
                    categorized[category].map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.productDisplayName}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('documents.versionLabel')}: {doc.documentVersion || doc.semanticVersion}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              {t('documents.actions.download')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingDoc(doc)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('documents.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDuplicatingDoc(doc)}>
                              <Copy className="mr-2 h-4 w-4" />
                              {t('documents.actions.duplicate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingDoc(doc)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('documents.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {hasUploadProgress && (
        <Card>
          <CardHeader>
            <CardTitle>{t('documents.uploading')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('documents.uploading')}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {editingDoc && (
        <EditBenchDocumentDialog
          open={!!editingDoc}
          onOpenChange={(open) => {
            if (!open) {
              setEditingDoc(null);
              loadDocuments();
              onDocumentsChange?.();
            }
          }}
          document={editingDoc}
          benchId={benchId}
        />
      )}

      {duplicatingDoc && (
        <DuplicateDocumentDialog
          open={!!duplicatingDoc}
          onOpenChange={(open) => {
            if (!open) {
              setDuplicatingDoc(null);
              loadDocuments();
              onDocumentsChange?.();
            }
          }}
          document={duplicatingDoc}
          currentBenchId={benchId}
        />
      )}

      <AlertDialog open={!!deletingDoc} onOpenChange={(open) => !open && setDeletingDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('documents.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('documents.deleteConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteDoc.isPending}>
              {deleteDoc.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.delete')}
                </>
              ) : (
                t('common.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
