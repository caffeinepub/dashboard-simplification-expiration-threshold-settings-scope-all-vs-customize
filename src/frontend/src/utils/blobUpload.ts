import { ExternalBlob } from '../backend';

/**
 * Upload a file as an ExternalBlob with progress tracking
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress (0-100)
 * @returns ExternalBlob reference
 */
export async function uploadFileAsBlob(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<ExternalBlob> {
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  let blob = ExternalBlob.fromBytes(fileBytes);
  
  if (onProgress) {
    blob = blob.withUploadProgress(onProgress);
  }
  
  return blob;
}
