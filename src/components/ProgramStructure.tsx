'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useStore from '@/store';
import { useModuleStore } from '@/hooks/useModuleStore';
import { useModuleActions } from '@/hooks/useModuleActions';

interface ProgramStructureProps {
  onAddModule: () => void;
  onAddSequence: (moduleId: string) => void;
  onAddCourse: (moduleId: string, sequenceId: string) => void;
  onEditModule: (moduleId: string) => void;
  onEditSequence: (moduleId: string, sequenceId: string) => void;
  onEditCourse: (moduleId: string, sequenceId: string, courseId: string) => void;
}

interface ProgramItemFormData {
  title: string;
  description: string;
}

interface DialogState {
  type: 'module' | 'sequence' | 'course';
  mode: 'add' | 'edit';
  moduleId?: string;
  sequenceId?: string;
  itemId?: string;
  open: boolean;
}

const generateRandomColor = () => {
  // implement color generation logic here
  return '#000000';
};

const addModule = (projectId: string, data: any) => {
  // implement add module logic here
  return { id: 'new-module-id' };
};

const updateModule = (projectId: string, moduleId: string, data: any) => {
  // implement update module logic here
};

const addSequence = (projectId: string, moduleId: string, data: any) => {
  // implement add sequence logic here
};

const updateSequence = (projectId: string, moduleId: string, sequenceId: string, data: any) => {
  // implement update sequence logic here
};

const addCourse = (projectId: string, moduleId: string, sequenceId: string, data: any) => {
  // implement add course logic here
};

const updateCourse = (projectId: string, moduleId: string, sequenceId: string, courseId: string, data: any) => {
  // implement update course logic here
};

const toast = (options: any) => {
  // implement toast logic here
};

export default function ProgramStructure({ 
  onAddModule,
  onAddSequence,
  onAddCourse,
  onEditModule,
  onEditSequence,
  onEditCourse
}: ProgramStructureProps) {
  const currentProject = useStore(state => state.currentProject);
  const { modules } = useModuleStore();
  const [dialogState, setDialogState] = React.useState<DialogState>({
    type: 'module',
    mode: 'add',
    open: false,
  });

  const handleProgramItemSubmit = async (data: ProgramItemFormData) => {
    console.log('handleProgramItemSubmit - start', { currentProject, data });
    try {
      if (!currentProject) {
        throw new Error('No current project selected');
      }

      switch (dialogState.type) {
        case 'module':
          if (dialogState.mode === 'add') {
            console.log('Creating new module', { projectId: currentProject.id, data });
            const newModule = addModule(currentProject.id, {
              ...data,
              sequences: [],
              color: generateRandomColor()
            });
            console.log('Module created', newModule);
            if (!newModule) {
              throw new Error('Failed to create module');
            }
          } else if (dialogState.mode === 'edit' && dialogState.itemId) {
            console.log('Updating module', { moduleId: dialogState.itemId, data });
            updateModule(currentProject.id, dialogState.itemId, data);
          }
          break;

        case 'sequence':
          if (dialogState.mode === 'add' && dialogState.moduleId) {
            console.log('Creating new sequence', { moduleId: dialogState.moduleId, data });
            addSequence(currentProject.id, dialogState.moduleId, {
              ...data,
              courses: []
            });
          } else if (dialogState.mode === 'edit' && dialogState.moduleId && dialogState.itemId) {
            console.log('Updating sequence', { moduleId: dialogState.moduleId, sequenceId: dialogState.itemId, data });
            updateSequence(currentProject.id, dialogState.moduleId, dialogState.itemId, data);
          }
          break;

        case 'course':
          if (dialogState.mode === 'add' && dialogState.moduleId && dialogState.sequenceId) {
            console.log('Creating new course', { moduleId: dialogState.moduleId, sequenceId: dialogState.sequenceId, data });
            addCourse(currentProject.id, dialogState.moduleId, dialogState.sequenceId, {
              ...data,
              duration: 0,
              resources: []
            });
          } else if (dialogState.mode === 'edit' && dialogState.moduleId && dialogState.sequenceId && dialogState.itemId) {
            console.log('Updating course', { moduleId: dialogState.moduleId, sequenceId: dialogState.sequenceId, courseId: dialogState.itemId, data });
            updateCourse(currentProject.id, dialogState.moduleId, dialogState.sequenceId, dialogState.itemId, data);
          }
          break;
      }

      setDialogState(prev => ({ ...prev, open: false }));
    } catch (error) {
      console.error('Error handling program item submit:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Debug logs
  React.useEffect(() => {
    console.log('ProgramStructure - Render:', {
      currentProject: currentProject?.id,
      modulesCount: modules?.length,
      modules: modules
    });
  }, [currentProject, modules]);

  if (!currentProject) {
    return (
      <div className="p-6">
        <p>Sélectionnez un projet</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Programme</h2>
        <Button onClick={onAddModule}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau module
        </Button>
      </div>

      <div className="space-y-4">
        {Array.isArray(modules) && modules.map(module => (
          <div 
            key={module.id}
            className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
            style={{ borderColor: module.color }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{module.title}</h3>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEditModule(module.id)}
                >
                  Modifier
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onAddSequence(module.id)}
                >
                  + Séquence
                </Button>
              </div>
            </div>
            
            {module.description && (
              <p className="text-sm text-gray-500 mb-4">{module.description}</p>
            )}

            <div className="pl-4 space-y-3">
              {module.sequences?.map(sequence => (
                <div 
                  key={sequence.id}
                  className="p-3 border rounded-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{sequence.title}</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditSequence(module.id, sequence.id)}
                      >
                        Modifier
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onAddCourse(module.id, sequence.id)}
                      >
                        + Cours
                      </Button>
                    </div>
                  </div>

                  {sequence.description && (
                    <p className="text-sm text-gray-500 mb-3">{sequence.description}</p>
                  )}

                  <div className="pl-4 space-y-2">
                    {sequence.courses?.map(course => (
                      <div 
                        key={course.id}
                        className="p-2 border rounded"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium">{course.title}</h5>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEditCourse(module.id, sequence.id, course.id)}
                          >
                            Modifier
                          </Button>
                        </div>
                        {course.description && (
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
