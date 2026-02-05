import { ExternalBlob } from '../backend';

export async function getDefaultBenchPhoto(): Promise<ExternalBlob> {
  try {
    const response = await fetch('/assets/generated/test-bench-placeholder.dim_1400x800.png');
    if (!response.ok) {
      throw new Error('Failed to load default bench photo');
    }
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    return ExternalBlob.fromBytes(bytes);
  } catch (error) {
    console.error('Error loading default bench photo:', error);
    throw error;
  }
}
