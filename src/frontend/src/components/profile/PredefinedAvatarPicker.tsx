import { cn } from '@/lib/utils';
import { getAvatarPath, getAllAvatarIds } from '../../utils/avatars';

const AVATAR_LABELS: Record<string, string> = {
  duck: 'Duck',
  basketball: 'Basketball',
  rocket: 'Rocket',
  robot: 'Robot',
  toy: 'Toy',
  gear: 'Gear',
  coffee: 'Coffee',
  electric: 'Electric',
  lab: 'Lab',
  pcb: 'PCB',
  toolbox: 'Toolbox',
  deadline: 'Deadline',
  docs: 'Docs',
  maintenance: 'Maintenance',
  inventory: 'Inventory',
  analytics: 'Analytics',
};

interface PredefinedAvatarPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PredefinedAvatarPicker({ selectedId, onSelect }: PredefinedAvatarPickerProps) {
  const avatarIds = getAllAvatarIds();

  return (
    <div className="grid grid-cols-4 gap-3">
      {avatarIds.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={cn(
            'aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105',
            selectedId === id
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          )}
          title={AVATAR_LABELS[id] || id}
        >
          <img
            src={getAvatarPath(id)}
            alt={AVATAR_LABELS[id] || id}
            className="w-full h-full object-contain"
          />
        </button>
      ))}
    </div>
  );
}
