import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Upload, FileIcon, Download } from 'lucide-react';
import { ExternalBlob } from '../../../backend';
import { generateId } from '../../../utils/id';
import { useAssociateDocumentToBench, useRemoveDocumentFromBench, useGetBenchDocuments } from '../../../hooks/useQueries';
import { useActor } from '../../../hooks/useActor';
import { downloadDocument } from '../../../utils/download';
import { toast } from 'sonner';

interface BenchDocumentsEditorProps {
  benchId: string;
}

const DOCUMENT_CATEGORIES = ['Hardware', 'Software', 'Other(s)'] as const;

export function BenchDocumentsEditor({ benchId }: BenchDocumentsEditorProps) {
  const { actor } = useActor();
  const { data: documents = [], isLoading } = useGetBenchDocuments(benchId);
  const associateDoc = useAssociateDocumentToBench();
  const removeDoc = useRemoveDocumentFromBench();
  
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentVersion, setDocumentVersion] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory || !actor) {
      toast.error('Please select a category and file');
      return;
    }

    setUploading(true);
    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const fileBlob = ExternalBlob.fromBytes(fileBytes);
      
      const docId = generateId();
      
      await actor.createDocument(
        docId,
        selectedFile.name,
        BigInt(1),
        selectedCategory,
        fileBlob,
        '1.0',
        [],
        documentVersion.trim() || null
      );
      
      await associateDoc.mutateAsync({ documentId: docId, benchId });
      
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      setSelectedCategory('');
      setDocumentVersion('');
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (documentId: string, documentName: string) => {
    try {
      await removeDoc.mutateAsync({ documentId, benchId });
      toast.success(`Removed ${documentName}`);
    } catch (error: any) {
      console.error('Failed to remove document:', error);
      toast.error(error.message || 'Failed to remove document');
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      await downloadDocument(doc.fileReference, doc.productDisplayName);
      toast.success(`Downloaded ${doc.productDisplayName}`);
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.message || 'Failed to download document');
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>Add hardware, software, or other documentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Version (optional)</Label>
            <Input
              type="text"
              placeholder="e.g., 1.0, 2.3.5, e1r5"
              value={documentVersion}
              onChange={(e) => setDocumentVersion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>File</Label>
            <div className="border-2 border-dashed rounded-md p-4">
              <input
                type="file"
                id="doc-upload"
                className="hidden"
                onChange={handleFileSelect}
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('doc-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedCategory || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>

      {DOCUMENT_CATEGORIES.map((category) => {
        const categoryDocs = groupedDocuments[category] || [];
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>{categoryDocs.length} document(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents in this category</p>
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
                            <p className="text-xs text-muted-foreground">Version: {doc.documentVersion}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(doc.id, doc.productDisplayName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  );
}
