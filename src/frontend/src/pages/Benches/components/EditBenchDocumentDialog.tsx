import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileIcon, Upload, Trash2, Loader2 } from 'lucide-react';
import { Document } from '../../../backend';
import { useI18n } from '../../../i18n/useI18n';
import { useEditBenchDocument } from '../../../hooks/useQueries';
import { uploadFileAsBlob } from '../../../utils/blobUpload';
import { toast } from 'sonner';

interface EditBenchDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  benchId: string;
}

export function EditBenchDocumentDialog({
  open,
  onOpenChange,
  document,
  benchId,
}: EditBenchDocumentDialogProps) {
  const { t } = useI18n();
  const editDoc = useEditBenchDocument();
  
  const [displayName, setDisplayName] = useState(document.productDisplayName);
  const [semanticVersion, setSemanticVersion] = useState(document.semanticVersion);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim() || !semanticVersion.trim()) {
      toast.error(t('documents.editDialog.requiredFields'));
      return;
    }

    try {
      let fileBlob = document.fileReference;
      
      if (selectedFile) {
        setUploadProgress(0);
        fileBlob = await uploadFileAsBlob(selectedFile, (progress) => {
          setUploadProgress(progress);
        });
      }

      await editDoc.mutateAsync({
        benchId,
        documentId: document.id,
        updatedProductDisplayName: displayName.trim(),
        updatedSemanticVersion: semanticVersion.trim(),
        updatedFile: fileBlob,
      });

      toast.success(t('documents.editSuccess'));
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to edit document:', error);
      toast.error(error.message || t('documents.editDialog.updateFailed'));
    }
  };

  const isUploading = editDoc.isPending && selectedFile !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('documents.editDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('documents.editDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-doc-name">{t('documents.editDialog.nameLabel')}</Label>
            <Input
              id="edit-doc-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={editDoc.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-doc-version">{t('documents.editDialog.semanticVersionLabel')}</Label>
            <Input
              id="edit-doc-version"
              value={semanticVersion}
              onChange={(e) => setSemanticVersion(e.target.value)}
              placeholder={t('documents.versionPlaceholder')}
              disabled={editDoc.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('documents.editDialog.replaceFileLabel')}</Label>
            <div className="border-2 border-dashed rounded-md p-4">
              <input
                type="file"
                id="edit-doc-file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={editDoc.isPending}
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
                    onClick={() => setSelectedFile(null)}
                    disabled={editDoc.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => window.document.getElementById('edit-doc-file')?.click()}
                  disabled={editDoc.isPending}
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
                <span className="font-medium">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={editDoc.isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={editDoc.isPending}>
            {editDoc.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('documents.editDialog.saving')}
              </>
            ) : (
              t('documents.editDialog.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
