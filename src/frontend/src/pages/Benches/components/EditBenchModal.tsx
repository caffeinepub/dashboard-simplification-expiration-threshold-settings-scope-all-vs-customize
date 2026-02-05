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
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { TagsInput } from './TagsInput';
import { useUpdateTestBench, useGetBenchTagSuggestions } from '../../../hooks/useQueries';
import { validateAgileCode, validateUrl } from '../../../utils/validation';
import { ExternalBlob } from '../../../backend';
import type { Tag, TestBench } from '../../../backend';
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
  const { data: tagSuggestions = [] } = useGetBenchTagSuggestions();

  useEffect(() => {
    if (bench) {
      setName(bench.name);
      setSerialNumber(bench.serialNumber || '');
      setAgileCode(bench.agileCode || '');
      setPlmAgileUrl(bench.plmAgileUrl || '');
      setDecawebUrl(bench.decawebUrl || '');
      setDescription(bench.description);
      setTags(bench.tags);
      setPhotoPreview(bench.photo.getDirectURL());
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Bench name is required';
    }

    if (!serialNumber.trim()) {
      newErrors.serialNumber = 'Bench S/N is required';
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
      let photoBlob = bench.photo;
      
      if (photoFile) {
        const photoBytes = new Uint8Array(await photoFile.arrayBuffer());
        photoBlob = ExternalBlob.fromBytes(photoBytes);
      }

      await updateBench.mutateAsync({
        benchId: bench.id,
        name: name.trim(),
        serialNumber: serialNumber.trim(),
        agileCode: agileCode.trim() || '',
        plmAgileUrl: plmAgileUrl.trim() || '',
        decawebUrl: decawebUrl.trim() || '',
        description: description.trim(),
        photo: photoBlob,
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
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Test Bench</DialogTitle>
          <DialogDescription>
            Update bench information, photo, and metadata.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="photo">Bench Photo</Label>
              <div className="border-2 border-dashed rounded-md p-4">
                {photoPreview && (
                  <div className="space-y-2">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
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
                      size="sm"
                      onClick={() => document.getElementById('photo')?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                )}
              </div>
              {errors.photo && <p className="text-sm text-destructive">{errors.photo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Bench Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Bench S/N *</Label>
              <Input
                id="serialNumber"
                type="text"
                placeholder="e.g., SN-2024-001"
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value);
                  setErrors((prev) => ({ ...prev, serialNumber: '' }));
                }}
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
              />
              {errors.decawebUrl && (
                <p className="text-sm text-destructive">{errors.decawebUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
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
          <Button onClick={handleSubmit} disabled={updateBench.isPending}>
            {updateBench.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
