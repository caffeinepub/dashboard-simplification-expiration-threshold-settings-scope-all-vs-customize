import { useState } from 'react';
import { ExternalBlob } from '../../../backend';

interface BenchPhotoProps {
  photo: ExternalBlob;
  alt: string;
  className?: string;
}

export function BenchPhoto({ photo, alt, className = '' }: BenchPhotoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <img
        src="/assets/generated/test-bench-placeholder.dim_1400x800.png"
        alt={alt}
        className={className}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} flex items-center justify-center bg-muted`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        src={photo.getDirectURL()}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectFit: 'cover' }}
      />
    </>
  );
}
