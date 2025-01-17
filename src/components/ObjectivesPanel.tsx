import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ObjectiveNode from './ObjectiveNode';
import AssessmentPanel from './AssessmentPanel';
import RequirementsPanel from './RequirementsPanel';
import ProgramPanel from './ProgramPanel';
import { Project, TaxonomyLevel, Objective } from '@/types';
import useStore from '@/store';

interface Props {
  project: Project;
  onAddObjective: () => void;
  hoveredObjectiveId: string | null;
}

const taxonomyLevels: { level: TaxonomyLevel; label: string; number: number }[] = [
  { level: 'remembering', label: 'Remembering', number: 1 },
  { level: 'understanding', label: 'Understanding', number: 2 },
  { level: 'applying', label: 'Applying', number: 3 },
  { level: 'analyzing', label: 'Analyzing', number: 4 },
  { level: 'evaluating', label: 'Evaluating', number: 5 },
  { level: 'creating', label: 'Creating', number: 6 },
];

function generateObjectiveNumber(objective: Objective, objectives: Objective[], parentNumber: string = ''): string {
  if (objective.parent) {
    const siblings = objectives.filter(obj => obj.parent?.id === objective.parent.id);
    const index = siblings.findIndex(obj => obj.id === objective.id) + 1;
    return `${parentNumber}.${index}`;
  } else {
    const rootObjectives = objectives.filter(obj => !obj.parent);
    const index = rootObjectives.findIndex(obj => obj.id === objective.id) + 1;
    return `O${index}`;
  }
}

export default function ObjectivesPanel({ project, onAddObjective, hoveredObjectiveId }: Props) {
  const { updateObjective, setIsNewRequirementModalOpen } = useStore();
  const [selectedLevels, setSelectedLevels] = useState<Set<TaxonomyLevel>>(new Set());
  const [activeTab, setActiveTab] = useState('requirements');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDrop = (id: string, newParentId: string | null) => {
    const objective = project.objectives.find(obj => obj.id === id);
    if (!objective) return;

    const updatedObjective = {
      ...objective,
      parent: newParentId ? {
        id: newParentId,
        index: project.objectives.find(obj => obj.id === newParentId)?.index || 1
      } : null
    };

    updateObjective(updatedObjective);
  };

  const renderObjectiveTree = (parentId: string | null = null, level: number = 0, parentNumber: string = '') => {
    const objectives = project.objectives
      .filter(obj => parentId ? obj.parent?.id === parentId : !obj.parent)
      .filter(obj => selectedLevels.size === 0 || selectedLevels.has(obj.taxonomyLevel));
    
    return (
      <div className="space-y-2">
        {objectives.map((objective, index) => {
          const number = generateObjectiveNumber(objective, project.objectives, parentNumber);
          return (
            <ObjectiveNode
              key={objective.id}
              objective={objective}
              index={index}
              level={level}
              number={number}
              isHighlighted={hoveredObjectiveId === objective.id}
              onDrop={handleDrop}
            >
              {renderObjectiveTree(objective.id, level + 1, number)}
            </ObjectiveNode>
          );
        })}
      </div>
    );
  };

  const handleLevelToggle = (level: TaxonomyLevel) => {
    const newSelectedLevels = new Set(selectedLevels);
    if (newSelectedLevels.has(level)) {
      newSelectedLevels.delete(level);
    } else {
      newSelectedLevels.add(level);
    }
    setSelectedLevels(newSelectedLevels);
  };

  const getSelectedLevelsCount = () => selectedLevels.size;

  const handleAddClick = () => {
    if (activeTab === 'objectives') {
      onAddObjective();
    } else if (activeTab === 'requirements') {
      setIsNewRequirementModalOpen(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="inline-flex items-center p-1 bg-muted rounded-lg">
          <Button
            variant="ghost"
            className={`${
              activeTab === 'requirements'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            } rounded-md transition-colors`}
            onClick={() => setActiveTab('requirements')}
          >
            Requirements
          </Button>
          <Button
            variant="ghost"
            className={`${
              activeTab === 'objectives'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            } rounded-md transition-colors`}
            onClick={() => setActiveTab('objectives')}
          >
            Objectives
          </Button>
          <Button
            variant="ghost"
            className={`${
              activeTab === 'assessments'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            } rounded-md transition-colors`}
            onClick={() => setActiveTab('assessments')}
          >
            Assessments
          </Button>
          <Button
            variant="ghost"
            className={`${
              activeTab === 'program'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            } rounded-md transition-colors`}
            onClick={() => setActiveTab('program')}
          >
            Program
          </Button>
        </div>
        <div className="flex gap-2">
          {activeTab !== 'assessments' && (
            <>
              {activeTab === 'objectives' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="relative"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                      {getSelectedLevelsCount() > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
                        >
                          {getSelectedLevelsCount()}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {taxonomyLevels.map(({ level, label, number }) => (
                      <DropdownMenuCheckboxItem
                        key={level}
                        checked={selectedLevels.has(level)}
                        onCheckedChange={() => handleLevelToggle(level)}
                      >
                        <Badge variant={`level${number}`} className="mr-2">
                          Level {number}
                        </Badge>
                        {label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                size="sm"
                onClick={handleAddClick}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'requirements' && (
        <RequirementsPanel project={project} />
      )}

      {activeTab === 'objectives' && (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
        >
          <SortableContext
            items={project.objectives.map(obj => obj.id)}
            strategy={verticalListSortingStrategy}
          >
            {renderObjectiveTree()}
          </SortableContext>
        </DndContext>
      )}

      {activeTab === 'assessments' && (
        <AssessmentPanel 
          objectives={project.objectives}
          requirements={project.requirements}
        />
      )}

      {activeTab === 'program' && (
        <ProgramPanel project={project} />
      )}
    </div>
  );
}