import type { DragEvent, ReactNode } from 'react';

export interface DraggableNodeProps {
  type: string;
  label: string;
  icon?: ReactNode;
  onAdd?: (type: string) => void;
}

export const DraggableNode = ({ type, label, icon, onAdd }: DraggableNodeProps) => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.currentTarget.setAttribute('data-dragging', 'true');
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = (event: DragEvent<HTMLDivElement>) => {
    event.currentTarget.removeAttribute('data-dragging');
  };

  const handleClick = () => {
    onAdd?.(type);
  };

  return (
    <div
      className="vs-draggable-node"
      role="button"
      tabIndex={0}
      aria-label={`Add ${label} node`}
      onDragStart={(e) => onDragStart(e, type)}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      draggable
    >
      {icon && <span className="vs-draggable-node__icon">{icon}</span>}
      <span className="vs-draggable-node__label">{label}</span>
    </div>
  );
};
