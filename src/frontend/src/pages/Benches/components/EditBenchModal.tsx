import { useState, useEffect } from 'react';
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
import { Loader2, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TagsInput } from './TagsInput';
import { useUpdateTestBench } from '../../../hooks/useQueries';
import { validateAgileCode, validateUrl } from '../../../utils/validation';
import { rewriteDescription } from '../../../utils/rewriteDescription';
import { uploadFileAsBlob } from '../../../utils/blobUpload';
import type { TestBench, Tag, ExternalBlob } from '../../../backend';
import { toast } from 'sonner';

interface EditBenchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bench: TestBench;
}

export function EditBenchModal({ open, onOpenChange, bench }: EditBenchModalProps) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [agileCode, setAgileCode] = useState('');
  const [plmAgileUrl, setPlmAgileUrl] = useState('');
  const [decawebUrl, setDecawebUrl] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateBench = useUpdateTestBench();

  useEffect(() => {
    if (bench) {
      setName(bench.name);
      setSerialNumber(bench.serialNumber || '');
      setAgileCode(bench.agileCode || '');
      setPlmAgileUrl(bench.plmAgileUrl || '');
      setDecawebUrl(bench.decawebUrl || '');
      setDescription(bench.description);
      setTags(bench.tags);
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }, [bench]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let photoBlob: ExternalBlob = bench.photo;

      if (photoFile) {
        photoBlob = await uploadFileAsBlob(photoFile);
      }

      await updateBench.mutateAsync({
        benchId: bench.id,
        name: name.trim(),
        serialNumber: serialNumber.trim() || '',
        agileCode: agileCode.trim() || '',
        plmAgileUrl: plmAgileUrl.trim() || '',
        decawebUrl: decawebUrl.trim() || '',
        description: description.trim(),
        photo: photoBlob,
        photoUrl: bench.photoUrl || null,
        tags,
      });

      toast.success('Bench updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update bench:', error);
      toast.error(error.message || 'Failed to update bench');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Test Bench</DialogTitle>
          <DialogDescription>
            Update the test bench information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-photo">Bench Photo</Label>
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
                      disabled={updateBench.isPending}
                    >
                      Cancel Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="edit-photo"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handlePhotoChange}
                      disabled={updateBench.isPending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('edit-photo')?.click()}
                      disabled={updateBench.isPending}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Change Photo (PNG/JPEG)
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Current photo will be kept if not changed
                    </p>
                  </>
                )}
              </div>
              {errors.photo && <p className="text-sm text-destructive">{errors.photo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Bench Name *</Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="e.g., RF Test Bench A"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                disabled={updateBench.isPending}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-serialNumber">Bench S/N</Label>
              <Input
                id="edit-serialNumber"
                type="text"
                placeholder="e.g., SN-2024-001 (optional)"
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value);
                  setErrors((prev) => ({ ...prev, serialNumber: '' }));
                }}
                disabled={updateBench.isPending}
              />
              {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-agileCode">AGILE Code</Label>
              <Input
                id="edit-agileCode"
                type="text"
                placeholder="S123456 (optional)"
                value={agileCode}
                onChange={(e) => {
                  setAgileCode(e.target.value);
                  setErrors((prev) => ({ ...prev, agileCode: '' }));
                }}
                disabled={updateBench.isPending}
              />
              {errors.agileCode && <p className="text-sm text-destructive">{errors.agileCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plmAgileUrl">PLM AGILE URL</Label>
              <Input
                id="edit-plmAgileUrl"
                type="url"
                placeholder="https://plm.example.com/bench/... (optional)"
                value={plmAgileUrl}
                onChange={(e) => {
                  setPlmAgileUrl(e.target.value);
                  setErrors((prev) => ({ ...prev, plmAgileUrl: '' }));
                }}
                disabled={updateBench.isPending}
              />
              {errors.plmAgileUrl && (
                <p className="text-sm text-destructive">{errors.plmAgileUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-decawebUrl">Decaweb URL</Label>
              <Input
                id="edit-decawebUrl"
                type="url"
                placeholder="https://decaweb.example.com/bench/... (optional)"
                value={decawebUrl}
                onChange={(e) => {
                  setDecawebUrl(e.target.value);
                  setErrors((prev) => ({ ...prev, decawebUrl: '' }));
                }}
                disabled={updateBench.isPending}
              />
              {errors.decawebUrl && (
                <p className="text-sm text-destructive">{errors.decawebUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-description">Description *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRewriteDescription}
                  disabled={!description.trim() || updateBench.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Rewrite
                </Button>
              </div>
              <Textarea
                id="edit-description"
                placeholder="Describe the bench and project..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                }}
                rows={4}
                disabled={updateBench.isPending}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagsInput value={tags} onChange={setTags} suggestions={[]} />
              <p className="text-sm text-muted-foreground">
                Add tags to help categorize and find this bench. Press Enter to add a new tag.
              </p>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateBench.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={updateBench.isPending}
          >
            {updateBench.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Bench'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
