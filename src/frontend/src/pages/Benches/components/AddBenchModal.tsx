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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TagsInput } from './TagsInput';
import { DocumentCategoriesInput, type DocumentCategory } from './DocumentCategoriesInput';
import { BenchComponentsTableEditor } from './BenchComponentsTableEditor';
import { useCreateTestBench, useGetBenchTagSuggestions } from '../../../hooks/useQueries';
import { validateAgileCode, validateUrl } from '../../../utils/validation';
import { generateId } from '../../../utils/id';
import { rewriteDescription } from '../../../utils/rewriteDescription';
import { getDefaultBenchPhoto } from '../../../utils/defaultBenchPhoto';
import { uploadFileAsBlob } from '../../../utils/blobUpload';
import { ExternalBlob } from '../../../backend';
import type { Tag, Component } from '../../../backend';
import { toast } from 'sonner';

interface AddBenchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DocumentInput {
  id: string;
  productDisplayName: string;
  category: string;
  fileReference: ExternalBlob;
  semanticVersion: string;
  tags: Tag[];
  documentVersion?: string;
}

export function AddBenchModal({ open, onOpenChange }: AddBenchModalProps) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [agileCode, setAgileCode] = useState('');
  const [plmAgileUrl, setPlmAgileUrl] = useState('');
  const [decawebUrl, setDecawebUrl] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const createBench = useCreateTestBench();
  const { data: tagSuggestions = [] } = useGetBenchTagSuggestions();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  };

  const handleRewriteDescription = () => {
    if (!description.trim()) {
      return;
    }
    const rewritten = rewriteDescription(description);
    setDescription(rewritten);
    toast.success('Description rewritten');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Bench name is required';
    }

    if (agileCode.trim()) {
      const agileError = validateAgileCode(agileCode);
      if (agileError) {
        newErrors.agileCode = agileError;
      }
    }

    if (plmAgileUrl.trim()) {
      const urlError = validateUrl(plmAgileUrl);
      if (urlError) {
        newErrors.plmAgileUrl = urlError;
      }
    }

    if (decawebUrl.trim()) {
      const urlError = validateUrl(decawebUrl);
      if (urlError) {
        newErrors.decawebUrl = urlError;
      }
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    documentCategories.forEach((category, index) => {
      if (!category.categoryName.trim()) {
        newErrors[`category-${index}`] = 'Category type is required';
      }
      if (category.files.length === 0) {
        newErrors[`category-files-${index}`] = 'At least one file is required per category';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const benchId = generateId();

      // Upload photo
      let photoBlob: ExternalBlob;
      if (photoFile) {
        photoBlob = await uploadFileAsBlob(photoFile, (progress) => {
          setUploadProgress(Math.min(progress * 0.2, 20));
        });
      } else {
        photoBlob = await getDefaultBenchPhoto();
        setUploadProgress(20);
      }

      // Upload documents with progress
      const documents: DocumentInput[] = [];
      const totalFiles = documentCategories.reduce((sum, cat) => sum + cat.files.length, 0);
      let filesProcessed = 0;

      for (const category of documentCategories) {
        for (const fileData of category.files) {
          try {
            const fileBlob = await uploadFileAsBlob(fileData.file, (progress) => {
              const baseProgress = 20 + ((filesProcessed + progress / 100) / totalFiles) * 70;
              setUploadProgress(Math.min(baseProgress, 90));
            });

            documents.push({
              id: generateId(),
              productDisplayName: fileData.file.name,
              category: category.categoryName,
              fileReference: fileBlob,
              semanticVersion: '1.0',
              tags: tags,
              documentVersion: fileData.version.trim() || undefined,
            });

            filesProcessed++;
          } catch (error: any) {
            console.error(`Failed to upload ${fileData.file.name}:`, error);
            if (error.message?.includes('exceeds') || error.message?.includes('too large')) {
              throw new Error(`File "${fileData.file.name}" is too large. Please use a smaller file.`);
            }
            throw error;
          }
        }
      }

      setUploadProgress(95);

      await createBench.mutateAsync({
        id: benchId,
        name: name.trim(),
        serialNumber: serialNumber.trim() || '',
        agileCode: agileCode.trim() || '',
        plmAgileUrl: plmAgileUrl.trim() || '',
        decawebUrl: decawebUrl.trim() || '',
        description: description.trim(),
        photo: photoBlob,
        tags,
        documents,
        components,
      });

      setUploadProgress(100);
      toast.success('Test bench created successfully');
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create bench:', error);
      toast.error(error.message || 'Failed to create bench');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setName('');
    setSerialNumber('');
    setAgileCode('');
    setPlmAgileUrl('');
    setDecawebUrl('');
    setDescription('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setTags([]);
    setDocumentCategories([]);
    setComponents([]);
    setErrors({});
    setUploadProgress(0);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createBench.isPending && !isUploading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Test Bench</DialogTitle>
          <DialogDescription>
            Create a new test bench record with photo, description, components, and documents.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading files...</span>
                  <span className="font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="photo">Bench Photo</Label>
              <div className="border-2 border-dashed rounded-md p-4">
                {photoPreview ? (
                  <div className="space-y-2">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      disabled={isUploading}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="photo"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handlePhotoChange}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('photo')?.click()}
                      disabled={isUploading}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload Photo (PNG/JPEG)
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Optional - a default image will be used if not provided
                    </p>
                  </>
                )}
              </div>
              {errors.photo && <p className="text-sm text-destructive">{errors.photo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Bench Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., RF Test Bench A"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                disabled={isUploading}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Bench S/N</Label>
              <Input
                id="serialNumber"
                type="text"
                placeholder="e.g., SN-2024-001 (optional)"
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value);
                  setErrors((prev) => ({ ...prev, serialNumber: '' }));
                }}
                disabled={isUploading}
              />
              {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agileCode">AGILE Code</Label>
              <Input
                id="agileCode"
                type="text"
                placeholder="S123456 (optional)"
                value={agileCode}
                onChange={(e) => {
                  setAgileCode(e.target.value);
                  setErrors((prev) => ({ ...prev, agileCode: '' }));
                }}
                disabled={isUploading}
              />
              {errors.agileCode && <p className="text-sm text-destructive">{errors.agileCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plmAgileUrl">PLM AGILE URL</Label>
              <Input
                id="plmAgileUrl"
                type="url"
                placeholder="https://plm.example.com/bench/... (optional)"
                value={plmAgileUrl}
                onChange={(e) => {
                  setPlmAgileUrl(e.target.value);
                  setErrors((prev) => ({ ...prev, plmAgileUrl: '' }));
                }}
                disabled={isUploading}
              />
              {errors.plmAgileUrl && (
                <p className="text-sm text-destructive">{errors.plmAgileUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="decawebUrl">Decaweb URL</Label>
              <Input
                id="decawebUrl"
                type="url"
                placeholder="https://decaweb.example.com/bench/... (optional)"
                value={decawebUrl}
                onChange={(e) => {
                  setDecawebUrl(e.target.value);
                  setErrors((prev) => ({ ...prev, decawebUrl: '' }));
                }}
                disabled={isUploading}
              />
              {errors.decawebUrl && (
                <p className="text-sm text-destructive">{errors.decawebUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRewriteDescription}
                  disabled={!description.trim() || isUploading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Rewrite
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Describe the bench and project..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                }}
                rows={4}
                disabled={isUploading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagsInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
              <p className="text-sm text-muted-foreground">
                Add tags to help categorize and find this bench. Press Enter to add a new tag.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Components (Health Book)</Label>
              <BenchComponentsTableEditor
                components={components}
                onChange={setComponents}
                effectiveThreshold={30}
                benchId=""
              />
              <p className="text-sm text-muted-foreground">
                Add equipment components with validity and expiration dates.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Documents</Label>
              <DocumentCategoriesInput
                value={documentCategories}
                onChange={setDocumentCategories}
              />
              {Object.keys(errors)
                .filter((key) => key.startsWith('category'))
                .map((key) => (
                  <p key={key} className="text-sm text-destructive">
                    {errors[key]}
                  </p>
                ))}
              <p className="text-sm text-muted-foreground">
                Select category type (Hardware, Software, or Other(s)) and attach files. Optionally specify a version for each document. Large files are supported via chunked upload.
              </p>
            </div>

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createBench.isPending || isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createBench.isPending || isUploading}>
            {(createBench.isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Bench
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
