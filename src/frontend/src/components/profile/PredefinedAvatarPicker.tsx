import { cn } from '@/lib/utils';

const PREDEFINED_AVATARS = [
  { id: 'duck', label: 'Duck', path: '/assets/avatars/duck.svg' },
  { id: 'basketball', label: 'Basketball', path: '/assets/avatars/basketball.svg' },
  { id: 'rocket', label: 'Rocket', path: '/assets/avatars/rocket.svg' },
  { id: 'robot', label: 'Robot', path: '/assets/avatars/robot.svg' },
];

interface PredefinedAvatarPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PredefinedAvatarPicker({ selectedId, onSelect }: PredefinedAvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {PREDEFINED_AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onSelect(avatar.id)}
          className={cn(
            'aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105',
            selectedId === avatar.id
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          )}
        >
          <img
            src={avatar.path}
            alt={avatar.label}
            className="w-full h-full object-contain"
          />
        </button>
      ))}
    </div>
  );
}
