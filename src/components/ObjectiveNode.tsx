import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, ChevronRight, ChevronDown, Pencil, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Objective, TaxonomyLevel } from '@/types';
import { taxonomyConfig } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import useStore from '@/store';

interface Props {
  objective: Objective;
  index: number;
  level: number;
  number: string;
  isHighlighted?: boolean;
  onDrop?: (id: string, parentId: string | null) => void;
  children?: React.ReactNode;
}

export default function ObjectiveNode({ objective, index, level, number, children, isHighlighted = false, onDrop }: Props) {
  console.log('Rendering objective:', objective); // Debug log

  const { 
    removeObjective, 
    setSelectedParentId, 
    setIsNewObjectiveModalOpen, 
    setEditingObjective,
    duplicateObjective,
  } = useStore();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [dragOverPosition, setDragOverPosition] = React.useState<'top' | 'bottom' | 'center' | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: objective.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${level * 1.5}rem`,
  };

  const handleAddSubObjective = () => {
    setSelectedParentId(objective.id);
    setIsNewObjectiveModalOpen(true);
  };

  const handleEdit = () => {
    setEditingObjective(objective);
    setIsNewObjectiveModalOpen(true);
  };

  const handleDuplicate = () => {
    duplicateObjective(objective);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDragOverPosition('top');
    } else if (y > height * 0.75) {
      setDragOverPosition('bottom');
    } else {
      setDragOverPosition('center');
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId !== objective.id && onDrop) {
      if (dragOverPosition === 'center') {
        // Make it a child of this objective
        onDrop(draggedId, objective.id);
      } else {
        // Keep it at the same level as this objective
        onDrop(draggedId, objective.parentId);
      }
    }

    setIsDragOver(false);
    setDragOverPosition(null);
  };

  const hasChildren = children && React.Children.count(children) > 0;

  return (
    <div ref={setNodeRef} style={style}>
      <div 
        className={cn(
          "relative flex items-start gap-2 bg-card p-3 rounded-lg border shadow-sm transition-all group",
          isHighlighted ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/20',
          isDragOver ? 'border-primary ring-2 ring-primary/20' : ''
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', objective.id);
        }}
      >
        {isDragOver && dragOverPosition === 'top' && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
        )}
        {isDragOver && dragOverPosition === 'bottom' && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
        )}
        {isDragOver && dragOverPosition === 'center' && (
          <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
        )}

        <div className="flex items-center gap-2">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <div
            className="cursor-grab hover:text-primary/80 touch-none p-1"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="text-xs font-mono">
              {number}
            </Badge>
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-lg",
                taxonomyConfig[objective.taxonomyLevel].color
              )}>
                {React.createElement(taxonomyConfig[objective.taxonomyLevel].icon, {
                  className: "h-4 w-4"
                })}
              </div>
              <Badge className={cn(
                "text-xs",
                taxonomyConfig[objective.taxonomyLevel].color
              )}>
                {taxonomyConfig[objective.taxonomyLevel].label}
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              {objective.dimension}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {objective.workloadHours}h
            </Badge>
            <span className="font-medium">{objective.verb}</span>
          </div>
          {objective.description && (
            <p className="text-sm text-muted-foreground">
              {objective.description}
            </p>
          )}
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicate}
            className="h-8 w-8 p-0"
            title="Duplicate objective"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddSubObjective}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeObjective(objective.id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && children}
    </div>
  );
}