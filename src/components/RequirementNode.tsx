import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, ChevronRight, ChevronDown, Pencil, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Requirement, TaxonomyLevel } from '@/types';
import useStore from '@/store';

interface Props {
  requirement: Requirement;
  index: number;
  level: number;
  number: string;
  isHighlighted?: boolean;
  onDrop?: (id: string, parentId: string | null) => void;
  children?: React.ReactNode;
}

const levelNumbers: Record<TaxonomyLevel, number> = {
  remembering: 1,
  understanding: 2,
  applying: 3,
  analyzing: 4,
  evaluating: 5,
  creating: 6,
};

export default function RequirementNode({ requirement, index, level, number, children, isHighlighted = false, onDrop }: Props) {
  const { 
    removeRequirement, 
    setSelectedRequirementParentId, 
    setIsNewRequirementModalOpen, 
    setEditingRequirement,
    duplicateRequirement,
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
  } = useSortable({ id: requirement.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${level * 1.5}rem`,
  };

  const handleAddSubRequirement = () => {
    setSelectedRequirementParentId(requirement.id);
    setIsNewRequirementModalOpen(true);
  };

  const handleEdit = () => {
    setEditingRequirement(requirement);
    setIsNewRequirementModalOpen(true);
  };

  const handleDuplicate = () => {
    duplicateRequirement(requirement);
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
    
    if (draggedId !== requirement.id && onDrop) {
      if (dragOverPosition === 'center') {
        // Make it a child of this requirement
        onDrop(draggedId, requirement.id);
      } else {
        // Keep it at the same level as this requirement
        onDrop(draggedId, requirement.parentId);
      }
    }

    setIsDragOver(false);
    setDragOverPosition(null);
  };

  const hasChildren = requirement.children && requirement.children.length > 0;

  return (
    <div ref={setNodeRef} style={style}>
      <div 
        className={`relative flex items-center gap-2 bg-card p-3 rounded-lg border shadow-sm transition-all group
          ${isHighlighted ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/20'}
          ${isDragOver ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', requirement.id);
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-muted-foreground">{number}</span>
            <Badge variant={`level${levelNumbers[requirement.level]}`}>
              Level {levelNumbers[requirement.level]}
            </Badge>
            <Badge variant="dimension">{requirement.dimension}</Badge>
            <span className="font-medium">{requirement.verb}</span>
            <span className="text-sm text-muted-foreground">{requirement.dimensionText}</span>
          </div>
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
            title="Duplicate requirement"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddSubRequirement}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeRequirement(requirement.id)}
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