import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { Trash2, Upload, FileIcon, Download, Pencil } from 'lucide-react';
import { ExternalBlob, Document } from '../../../backend';
import { generateId } from '../../../utils/id';
import { uploadFileAsBlob } from '../../../utils/blobUpload';
import { useAssociateDocumentToBench, useRemoveDocumentFromBench, useGetTestBench } from '../../../hooks/useQueries';
import { useActor } from '../../../hooks/useActor';
import { downloadDocument } from '../../../utils/download';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n/useI18n';

interface BenchDocumentsEditorProps {
  benchId: string;
}

const DOCUMENT_CATEGORIES = ['Hardware', 'Software', 'Other(s)'] as const;

export function BenchDocumentsEditor({ benchId }: BenchDocumentsEditorProps) {
  const { t } = useI18n();
  const { actor } = useActor();
  const { data: bench } = useGetTestBench(benchId);
  const associateDoc = useAssociateDocumentToBench();
  const removeDoc = useRemoveDocumentFromBench();
  
  const [editingCategory, setEditingCategory] = useState<Record<string, boolean>>({
    Hardware: false,
    Software: false,
    'Other(s)': false,
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [documentVersions, setDocumentVersions] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; name: string } | null>(null);

  // Get documents from bench
  const [documents, setDocuments] = useState<Document[]>([]);

  // Load documents when bench data is available
  useEffect(() => {
    const loadDocuments = async () => {
      if (!actor || !bench) return;
      
      try {
        const allDocs = await actor.filterDocumentsByTags([]);
        const benchDocs = allDocs.filter(doc => 
          bench.documents.some(([docId]) => docId === doc.id)
        );
        setDocuments(benchDocs);
      } catch (error) {
        console.error('Failed to load documents:', error);
      }
    };
    
    loadDocuments();
  }, [actor, bench]);

  const handleFileSelect = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [category]: file }));
    }
  };

  const handleUpload = async (category: string) => {
    const selectedFile = selectedFiles[category];
    if (!selectedFile || !actor) {
      toast.error(t('documents.uploadFailed'));
      return;
    }

    setUploading((prev) => ({ ...prev, [category]: true }));
    setUploadProgress((prev) => ({ ...prev, [category]: 0 }));

    try {
      const fileBlob = await uploadFileAsBlob(selectedFile, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [category]: progress }));
      });
      
      const docId = generateId();
      
      await actor.createDocument(
        docId,
        selectedFile.name,
        BigInt(1),
        category,
        fileBlob,
        '1.0',
        [],
        documentVersions[category]?.trim() || null
      );
      
      await associateDoc.mutateAsync({ documentId: docId, benchId });
      
      toast.success(t('documents.uploaded'));
      setSelectedFiles((prev) => ({ ...prev, [category]: null }));
      setDocumentVersions((prev) => ({ ...prev, [category]: '' }));
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      if (error.message?.includes('exceeds') || error.message?.includes('too large')) {
        toast.error(t('documents.fileTooLarge'));
      } else {
        toast.error(error.message || t('documents.uploadFailed'));
      }
    } finally {
      setUploading((prev) => ({ ...prev, [category]: false }));
      setUploadProgress((prev) => ({ ...prev, [category]: 0 }));
    }
  };

  const handleRemoveClick = (documentId: string, documentName: string) => {
    setDocumentToDelete({ id: documentId, name: documentName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!documentToDelete) return;

    try {
      await removeDoc.mutateAsync({ documentId: documentToDelete.id, benchId });
      toast.success(`${t('documents.removed')} ${documentToDelete.name}`);
    } catch (error: any) {
      console.error('Failed to remove document:', error);
      toast.error(error.message || t('documents.removeFailed'));
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc.fileReference, doc.productDisplayName);
      toast.success(`${t('documents.downloaded')} ${doc.productDisplayName}`);
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.message || t('documents.downloadFailed'));
    }
  };

  const toggleEditMode = (category: string) => {
    setEditingCategory((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'Hardware': return t('documents.hardware');
      case 'Software': return t('documents.software');
      case 'Other(s)': return t('documents.others');
      default: return category;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {DOCUMENT_CATEGORIES.map((category) => {
          const categoryDocs = groupedDocuments[category] || [];
          const isEditing = editingCategory[category];
          const selectedFile = selectedFiles[category];
          const isUploading = uploading[category];
          const progress = uploadProgress[category] || 0;

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{getCategoryLabel(category)}</CardTitle>
                    <CardDescription>{categoryDocs.length} {t('documents.count')}</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleEditMode(category)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {isEditing ? t('documents.done') : t('documents.edit')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                    <div className="space-y-2">
                      <Label>{t('documents.versionLabel')}</Label>
                      <Input
                        type="text"
                        placeholder={t('documents.versionPlaceholder')}
                        value={documentVersions[category] || ''}
                        onChange={(e) =>
                          setDocumentVersions((prev) => ({ ...prev, [category]: e.target.value }))
                        }
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('documents.fileLabel')}</Label>
                      <div className="border-2 border-dashed rounded-md p-4">
                        <input
                          type="file"
                          id={`doc-upload-${category}`}
                          className="hidden"
                          onChange={(e) => handleFileSelect(category, e)}
                          disabled={isUploading}
                        />
                        {selectedFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4" />
                              <span className="text-sm">{selectedFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedFiles((prev) => ({ ...prev, [category]: null }))
                              }
                              disabled={isUploading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              document.getElementById(`doc-upload-${category}`)?.click()
                            }
                            disabled={isUploading}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {t('documents.selectFile')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('documents.uploading')}</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}

                    <Button
                      onClick={() => handleUpload(category)}
                      disabled={!selectedFile || isUploading}
                      className="w-full"
                    >
                      {isUploading ? t('documents.uploading') : t('documents.uploadDocument')}
                    </Button>
                  </div>
                )}

                {categoryDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('documents.noDocuments')}</p>
                ) : (
                  <div className="space-y-2">
                    {categoryDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-muted rounded"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileIcon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.productDisplayName}</p>
                            {doc.documentVersion && (
                              <p className="text-xs text-muted-foreground">
                                {t('documents.version')}: {doc.documentVersion}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveClick(doc.id, doc.productDisplayName)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('documents.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('documents.removeDesc').replace('{name}', documentToDelete?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('benches.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
