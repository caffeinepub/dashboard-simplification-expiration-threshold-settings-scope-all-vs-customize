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
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { TagsInput } from './TagsInput';
import { DocumentCategoriesInput, type DocumentCategory } from './DocumentCategoriesInput';
import { BenchComponentsTableEditor } from './BenchComponentsTableEditor';
import { useCreateTestBench, useGetBenchTagSuggestions } from '../../../hooks/useQueries';
import { validateAgileCode, validateUrl } from '../../../utils/validation';
import { generateId } from '../../../utils/id';
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
  const [agileCode, setAgileCode] = useState('');
  const [plmAgileUrl, setPlmAgileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!photoFile) {
      newErrors.photo = 'Bench photo is required';
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

    try {
      const benchId = generateId();

      const photoBytes = new Uint8Array(await photoFile!.arrayBuffer());
      const photoBlob = ExternalBlob.fromBytes(photoBytes);

      const documents: DocumentInput[] = [];
      for (const category of documentCategories) {
        for (const fileData of category.files) {
          const fileBytes = new Uint8Array(await fileData.file.arrayBuffer());
          const fileBlob = ExternalBlob.fromBytes(fileBytes);
          documents.push({
            id: generateId(),
            productDisplayName: fileData.file.name,
            category: category.categoryName,
            fileReference: fileBlob,
            semanticVersion: '1.0',
            tags: tags,
            documentVersion: fileData.version.trim() || undefined,
          });
        }
      }

      await createBench.mutateAsync({
        id: benchId,
        name: name.trim(),
        agileCode: agileCode.trim() || '',
        plmAgileUrl: plmAgileUrl.trim() || '',
        description: description.trim(),
        photo: photoBlob,
        tags,
        documents,
        components,
      });

      toast.success('Test bench created successfully');
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create bench:', error);
      toast.error(error.message || 'Failed to create bench');
    }
  };

  const resetForm = () => {
    setName('');
    setAgileCode('');
    setPlmAgileUrl('');
    setDescription('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setTags([]);
    setDocumentCategories([]);
    setComponents([]);
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createBench.isPending) {
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
            <div className="space-y-2">
              <Label htmlFor="photo">Bench Photo *</Label>
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
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('photo')?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload Photo (PNG/JPEG)
                    </Button>
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
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
              />
              {errors.plmAgileUrl && (
                <p className="text-sm text-destructive">{errors.plmAgileUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the bench and project..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                }}
                rows={4}
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
                Select category type (Hardware, Software, or Other(s)) and attach files. Optionally specify a version for each document.
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
            disabled={createBench.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createBench.isPending}>
            {createBench.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Bench
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
