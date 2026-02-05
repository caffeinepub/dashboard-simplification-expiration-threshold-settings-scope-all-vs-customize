import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function NewBenchPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">New Bench</h1>
        <p className="text-muted-foreground mt-1">
          Create a new test bench with photo, description, and documents
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The bench creation form will be implemented in the next iteration. This will include
          fields for uploading a photo, entering a description, AGILE code, PLM link, tags, and
          attaching documents.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
          <CardDescription>What you'll be able to do on this page</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>Upload a photo of the test bench</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>Enter bench name, AGILE code, and PLM Agile URL</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>Add a detailed description</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>Attach relevant documents and specifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>Tag the bench for easy categorization and search</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
