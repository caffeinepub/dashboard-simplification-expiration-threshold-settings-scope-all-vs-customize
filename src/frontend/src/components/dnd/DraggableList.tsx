import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (items: T[]) => void;
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  className?: string;
}

export function DraggableList<T>({
  items,
  renderItem,
  onReorder,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  className,
}: DraggableListProps<T>) {
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragEnd={onDragEnd}
          className={cn(
            'flex items-center gap-2 p-3 rounded-md border bg-card transition-all',
            draggedIndex === index && 'opacity-50',
            draggedIndex !== null && draggedIndex !== index && 'border-primary/50',
            'hover:shadow-sm cursor-move'
          )}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {renderItem(item, index)}
          </div>
        </div>
      ))}
    </div>
  );
}
