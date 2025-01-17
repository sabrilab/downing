import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Project } from '@/types';
import RequirementNode from './RequirementNode';
import useStore from '@/store';

interface Props {
  project: Project;
}

function generateRequirementNumber(requirement: any, requirements: any[], parentNumber: string = ''): string {
  const siblings = requirements.filter(req => req.parentId === requirement.parentId);
  const index = siblings.findIndex(req => req.id === requirement.id) + 1;
  return parentNumber ? `${parentNumber}.${index}` : `R${index}`;
}

export default function RequirementsPanel({ project }: Props) {
  const { updateRequirement } = useStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDrop = (id: string, newParentId: string | null) => {
    const requirement = project.requirements.find(req => req.id === id);
    if (!requirement) return;

    if (requirement.parentId) {
      const oldParent = project.requirements.find(req => req.id === requirement.parentId);
      if (oldParent) {
        updateRequirement({
          ...oldParent,
          children: oldParent.children.filter(childId => childId !== id)
        });
      }
    }

    if (newParentId) {
      const newParent = project.requirements.find(req => req.id === newParentId);
      if (newParent) {
        updateRequirement({
          ...newParent,
          children: [...newParent.children, id]
        });
      }
    }

    updateRequirement({
      ...requirement,
      parentId: newParentId
    });
  };

  const renderRequirementTree = (parentId: string | null = null, level: number = 0, parentNumber: string = '') => {
    const currentRequirements = project.requirements.filter(req => req.parentId === parentId);
    
    return (
      <div className="space-y-2">
        {currentRequirements.map((requirement, index) => {
          const number = generateRequirementNumber(requirement, project.requirements, parentNumber);
          return (
            <RequirementNode
              key={requirement.id}
              requirement={requirement}
              index={index}
              level={level}
              number={number}
              onDrop={handleDrop}
            >
              {renderRequirementTree(requirement.id, level + 1, number)}
            </RequirementNode>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
      >
        <SortableContext
          items={project.requirements?.map(req => req.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {renderRequirementTree()}
        </SortableContext>
      </DndContext>

      {(!project.requirements || project.requirements.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No entry requirements defined yet.
          Click the + button to add prerequisites that learners must meet.
        </div>
      )}
    </div>
  );
}