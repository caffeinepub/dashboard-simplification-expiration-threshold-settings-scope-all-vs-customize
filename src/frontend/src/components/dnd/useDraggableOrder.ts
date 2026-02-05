import { useState } from 'react';

export function useDraggableOrder<T extends { id?: string }>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const resetOrder = (newItems: T[]) => {
    setItems(newItems);
  };

  return {
    items,
    draggedIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetOrder,
  };
}
