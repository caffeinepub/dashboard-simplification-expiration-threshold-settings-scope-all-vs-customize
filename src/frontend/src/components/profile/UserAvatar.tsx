import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { getAvatarPath } from '../../utils/avatars';
import type { ProfilePicture } from '../../backend';
import { cn } from '@/lib/utils';
import { useAvatarCacheBuster } from '../../hooks/useAvatarCacheBuster';

interface UserAvatarProps {
  profilePicture: ProfilePicture;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ profilePicture, name, size = 'md', className }: UserAvatarProps) {
  const { cacheBuster } = useAvatarCacheBuster();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
  };

  const getImageSrc = () => {
    if (profilePicture.__kind__ === 'avatar') {
      return getAvatarPath(profilePicture.avatar);
    } else if (profilePicture.__kind__ === 'custom') {
      const baseUrl = profilePicture.custom.getDirectURL();
      return `${baseUrl}?cb=${cacheBuster}`;
    }
    return getAvatarPath('duck');
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={getImageSrc()} alt={name || 'User avatar'} />
      <AvatarFallback>
        <User className="h-1/2 w-1/2" />
      </AvatarFallback>
    </Avatar>
  );
}
