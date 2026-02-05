import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Upload, FileIcon } from 'lucide-react';

export interface DocumentCategory {
  categoryName: string;
  files: Array<{ file: File; version: string }>;
}

interface DocumentCategoriesInputProps {
  value: DocumentCategory[];
  onChange: (categories: DocumentCategory[]) => void;
}

const ALLOWED_CATEGORIES = ['Hardware', 'Software', 'Other(s)'] as const;

export function DocumentCategoriesInput({ value, onChange }: DocumentCategoriesInputProps) {
  const addCategory = () => {
    onChange([...value, { categoryName: '', files: [] }]);
  };

  const removeCategory = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, name: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], categoryName: name };
    onChange(updated);
  };

  const addFiles = (index: number, newFiles: FileList | null) => {
    if (!newFiles) return;
    const updated = [...value];
    const filesWithVersion = Array.from(newFiles).map(file => ({ file, version: '' }));
    updated[index] = {
      ...updated[index],
      files: [...updated[index].files, ...filesWithVersion],
    };
    onChange(updated);
  };

  const removeFile = (categoryIndex: number, fileIndex: number) => {
    const updated = [...value];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      files: updated[categoryIndex].files.filter((_, i) => i !== fileIndex),
    };
    onChange(updated);
  };

  const updateFileVersion = (categoryIndex: number, fileIndex: number, version: string) => {
    const updated = [...value];
    updated[categoryIndex].files[fileIndex] = {
      ...updated[categoryIndex].files[fileIndex],
      version,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`category-${categoryIndex}`}>Category Type</Label>
                <Select
                  value={ALLOWED_CATEGORIES.includes(category.categoryName as any) ? category.categoryName : ''}
                  onValueChange={(value) => updateCategoryName(categoryIndex, value)}
                >
                  <SelectTrigger id={`category-${categoryIndex}`}>
                    <SelectValue placeholder="Select category type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Other(s)">Other(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(categoryIndex)}
                className="mt-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Files</Label>
              <div className="border-2 border-dashed rounded-md p-4 space-y-2">
                <input
                  type="file"
                  multiple
                  id={`files-${categoryIndex}`}
                  className="hidden"
                  onChange={(e) => addFiles(categoryIndex, e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => document.getElementById(`files-${categoryIndex}`)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Files
                </Button>

                {category.files.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {category.files.map((fileData, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="p-3 bg-muted rounded space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm">{fileData.file.name}</span>
                            <span className="text-muted-foreground flex-shrink-0 text-xs">
                              ({(fileData.file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => removeFile(categoryIndex, fileIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`version-${categoryIndex}-${fileIndex}`} className="text-xs whitespace-nowrap">
                            Version (optional):
                          </Label>
                          <Input
                            id={`version-${categoryIndex}-${fileIndex}`}
                            type="text"
                            placeholder="e.g., 1.0, 2.3.5, e1r5"
                            value={fileData.version}
                            onChange={(e) => updateFileVersion(categoryIndex, fileIndex, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addCategory} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Document Category
      </Button>
    </div>
  );
}
