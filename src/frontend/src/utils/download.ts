import { ExternalBlob } from '../backend';

/**
 * Downloads a document from an ExternalBlob reference
 * @param blob - The ExternalBlob containing the document
 * @param filename - The filename to use for the download
 */
export async function downloadDocument(blob: ExternalBlob, filename: string): Promise<void> {
  try {
    // Fetch the bytes from the blob
    const bytes = await blob.getBytes();
    
    // Create a Blob from the bytes
    const fileBlob = new Blob([bytes]);
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(fileBlob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download document:', error);
    throw new Error('Failed to download document');
  }
}
