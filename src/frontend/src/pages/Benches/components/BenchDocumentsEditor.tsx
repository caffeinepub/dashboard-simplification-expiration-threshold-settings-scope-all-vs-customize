import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { FileIcon, Upload, Trash2, MoreVertical, Download, Edit, Copy } from 'lucide-react';
import { useI18n } from '../../../i18n/useI18n';
import { useDashboardExportData, useCreateDocument, useAssociateDocumentToBench, useRemoveDocumentFromBench, useDeleteBenchDocument } from '../../../hooks/useQueries';
import { uploadFileAsBlob } from '../../../utils/blobUpload';
import { downloadDocument } from '../../../utils/download';
import { generateId } from '../../../utils/id';
import { toast } from 'sonner';
import { EditBenchDocumentDialog } from './EditBenchDocumentDialog';
import { DuplicateDocumentDialog } from './DuplicateDocumentDialog';
import type { Document } from '../../../backend';

interface BenchDocumentsEditorProps {
  benchId: string;
}

type Category = 'Hardware' | 'Software' | 'Other(s)';

export function BenchDocumentsEditor({ benchId }: BenchDocumentsEditorProps) {
  const { t } = useI18n();
  const { data: exportData } = useDashboardExportData();
  const createDoc = useCreateDocument();
  const associateDoc = useAssociateDocumentToBench();
  const removeDoc = useRemoveDocumentFromBench();
  const deleteDoc = useDeleteBenchDocument();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key in Category]?: File[] }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [documentVersions, setDocumentVersions] = useState<{ [key: string]: string }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [documentToDuplicate, setDocumentToDuplicate] = useState<Document | null>(null);

  // Get documents for this bench from exportData
  const documents = exportData?.allDocuments.filter((doc) =>
    doc.associatedBenches.includes(benchId)
  ) || [];

  const categories: Category[] = ['Hardware', 'Software', 'Other(s)'];

  const handleFileSelect = (category: Category, files: FileList | null) => {
    if (!files) return;
    setSelectedFiles((prev) => ({
      ...prev,
      [category]: Array.from(files),
    }));
  };

  const handleUpload = async (category: Category) => {
    const files = selectedFiles[category];
    if (!files || files.length === 0) {
      toast.error(t('documents.selectFile'));
      return;
    }

    try {
      for (const file of files) {
        const docId = generateId();
        const fileKey = `${category}-${file.name}`;

        setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

        const blob = await uploadFileAsBlob(file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileKey]: progress }));
        });

        const version = documentVersions[fileKey] || '';

        await createDoc.mutateAsync({
          id: docId,
          productDisplayName: file.name,
          version: BigInt(1),
          category,
          fileReference: blob,
          semanticVersion: '1.0.0',
          tags: [],
          documentVersion: version || null,
        });

        await associateDoc.mutateAsync({
          documentId: docId,
          benchId,
        });

        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[fileKey];
          return updated;
        });
      }

      toast.success(t('documents.uploaded'));
      setSelectedFiles((prev) => ({ ...prev, [category]: [] }));
      setEditingCategory(null);
      setDocumentVersions({});
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || t('documents.uploadFailed'));
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

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDoc.mutateAsync({
        benchId,
        documentId: documentToDelete.id,
      });
      toast.success(t('documents.deleteSuccess'));
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleEditClick = (doc: Document) => {
    setDocumentToEdit(doc);
    setEditDialogOpen(true);
  };

  const handleDuplicateClick = (doc: Document) => {
    setDocumentToDuplicate(doc);
    setDuplicateDialogOpen(true);
  };

  const getDocumentsByCategory = (category: Category) => {
    return documents.filter((doc) => doc.category === category);
  };

  const getCategoryTranslationKey = (category: Category): string => {
    const normalized = category.toLowerCase().replace('(s)', '');
    if (normalized === 'hardware') return 'documents.category.hardware';
    if (normalized === 'software') return 'documents.category.software';
    return 'documents.category.other';
  };

  const isUploading = createDoc.isPending || associateDoc.isPending;

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryDocs = getDocumentsByCategory(category);
        const isEditing = editingCategory === category;
        const files = selectedFiles[category] || [];

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t(getCategoryTranslationKey(category) as any)}</CardTitle>
                  <CardDescription>
                    {categoryDocs.length} {categoryDocs.length === 1 ? 'document' : 'documents'}
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('documents.upload')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label>{t('documents.selectFile')}</Label>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect(category, e.target.files)}
                      disabled={isUploading}
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected files</Label>
                      {files.map((file, idx) => {
                        const fileKey = `${category}-${file.name}`;
                        const progress = uploadProgress[fileKey];
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4" />
                              <span className="text-sm flex-1">{file.name}</span>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t('documents.version')}</Label>
                              <Input
                                placeholder={t('documents.versionPlaceholder')}
                                value={documentVersions[fileKey] || ''}
                                onChange={(e) =>
                                  setDocumentVersions((prev) => ({
                                    ...prev,
                                    [fileKey]: e.target.value,
                                  }))
                                }
                                disabled={isUploading}
                              />
                            </div>
                            {progress !== undefined && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{t('documents.uploading')}</span>
                                  <span className="font-medium">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpload(category)}
                      disabled={isUploading || files.length === 0}
                    >
                      {isUploading ? t('documents.uploading') : t('documents.upload')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null);
                        setSelectedFiles((prev) => ({ ...prev, [category]: [] }));
                        setDocumentVersions({});
                      }}
                      disabled={isUploading}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              )}

              {categoryDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('documents.noDocuments')}
                </p>
              ) : (
                <div className="space-y-2">
                  {categoryDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.productDisplayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('documents.version')}: {doc.documentVersion || '-'}
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
                            <Download className="h-4 w-4 mr-2" />
                            {t('documents.download')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(doc)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('documents.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateClick(doc)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t('documents.duplicate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(doc)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('documents.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('documents.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('documents.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              {t('documents.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {documentToEdit && (
        <EditBenchDocumentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          document={documentToEdit}
          benchId={benchId}
        />
      )}

      {documentToDuplicate && (
        <DuplicateDocumentDialog
          open={duplicateDialogOpen}
          onOpenChange={setDuplicateDialogOpen}
          document={documentToDuplicate}
          currentBenchId={benchId}
        />
      )}
    </div>
  );
}
