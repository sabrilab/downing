'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project, Objective, Assessment, Requirement, TaxonomyLevel } from './types';
import { Module, Session, Course, Sequence } from './types/program';

interface Store {
  projects: Project[];
  currentProject: Project | null;
  selectedParentId: string | null;
  isNewObjectiveModalOpen: boolean;
  editingObjective: Objective | null;
  requirements: Requirement[];
  selectedRequirementParentId: string | null;
  isNewRequirementModalOpen: boolean;
  editingRequirement: Requirement | null;

  // Project actions
  addProject: (name: string, options?: { template?: { color?: string; totalHours?: number }; totalHours?: string; description?: string }) => Project;
  updateProject: (project: Project) => void;

  // Objective actions
  addObjective: (objective: Partial<Objective>) => void;
  updateObjective: (objective: Objective) => void;
  removeObjective: (id: string) => void;
  
  // Requirement actions
  addRequirement: (requirement: Partial<Requirement>) => void;
  updateRequirement: (requirement: Requirement) => void;
  removeRequirement: (id: string) => void;

  setCurrentProject: (project: Project | null) => void;
  setSelectedParentId: (id: string | null) => void;
  setIsNewObjectiveModalOpen: (open: boolean) => void;
  setEditingObjective: (objective: Objective | null) => void;
  setSelectedRequirementParentId: (id: string | null) => void;
  setIsNewRequirementModalOpen: (open: boolean) => void;
  setEditingRequirement: (requirement: Requirement | null) => void;

  // Module actions
  addModule: (projectId: string, moduleData: Partial<Module>) => Module | null;
  updateModule: (projectId: string, moduleId: string, moduleData: Partial<Module>) => void;
  deleteModule: (projectId: string, moduleId: string) => void;
  moveModule: (projectId: string, moduleId: string, newIndex: number) => void;

  // Sequence actions
  addSequence: (projectId: string, moduleId: string, sequenceData: Partial<Sequence>) => void;
  updateSequence: (projectId: string, moduleId: string, sequenceId: string, sequenceData: Partial<Sequence>) => void;
  deleteSequence: (projectId: string, moduleId: string, sequenceId: string) => void;
  moveSequence: (projectId: string, moduleId: string, sequenceId: string, newIndex: number) => void;

  // Course actions
  addCourse: (projectId: string, moduleId: string, sequenceId: string, courseData: Partial<Course>) => void;
  updateCourse: (projectId: string, moduleId: string, sequenceId: string, courseId: string, courseData: Partial<Course>) => void;
  deleteCourse: (projectId: string, moduleId: string, sequenceId: string, courseId: string) => void;
  moveCourse: (projectId: string, moduleId: string, sequenceId: string, courseId: string, newIndex: number) => void;
}

interface Module {
  id: string;
  projectId: string;
  title: string;
  description: string;
  sequences: Sequence[];
  prerequisites: string[];
  objectives: string[];
  color: string;
}

interface Sequence {
  id: string;
  title: string;
  description: string;
  courses: Course[];
  requirements: string[];
  assessments: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  requirements: string[];
  assessments: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  modules: Module[];
}

const initialState = {
  projects: [{
    id: 'math-stats-2024',
    name: 'Mathématiques statistiques',
    description: 'Formation approfondie en statistiques mathématiques',
    modules: [
      {
        id: 'module-1',
        projectId: 'math-stats-2024',
        title: 'Fondamentaux des probabilités',
        description: 'Introduction aux concepts fondamentaux des probabilités',
        prerequisites: ['Calcul différentiel', 'Algèbre linéaire de base'],
        objectives: ['Comprendre les axiomes de probabilité', 'Maîtriser les variables aléatoires'],
        color: 'hsl(210, 85%, 75%)',
        sequences: [
          {
            id: 'seq-1-1',
            title: 'Théorie des ensembles et probabilités',
            description: 'Bases mathématiques et axiomes de probabilité',
            courses: [
              {
                id: 'course-1-1-1',
                title: 'Introduction aux ensembles',
                description: 'Opérations sur les ensembles et applications aux probabilités',
                duration: 3,
                requirements: ['Connaissances mathématiques de base'],
                assessments: ['QCM sur les opérations ensemblistes']
              }
            ],
            requirements: ['Mathématiques niveau terminale'],
            assessments: ['Examen écrit']
          }
        ]
      }
    ]
  }],
  currentProject: null,
  selectedParentId: null,
  isNewObjectiveModalOpen: false,
  editingObjective: null,
  requirements: [],
  selectedRequirementParentId: null,
  isNewRequirementModalOpen: false,
  editingRequirement: null,
};

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Project actions
      addProject: (name, options = {}) => {
        const project: Project = {
          id: Math.random().toString(36).substring(7),
          name,
          description: options.description || '',
          modules: [],
        };

        set((state) => ({
          projects: [...state.projects, project],
          currentProject: project,
        }));

        return project;
      },

      updateProject: (project) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? project : p
          ),
          currentProject: project,
        }));
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      // Objective actions
      addObjective: (objective: Partial<Objective>) => {
        set((state) => {
          console.log('Adding objective in store:', objective);

          const currentProject = state.currentProject;
          if (!currentProject) {
            console.error('No current project');
            return state;
          }

          if (!objective.taxonomyLevel) {
            console.error('No taxonomy level provided');
            return state;
          }

          const parentId = state.selectedParentId;
          const objectives = [...currentProject.objectives];
          const parent = parentId ? objectives.find(o => o.id === parentId) : null;
          
          const index = parent
            ? objectives.filter(o => o.parent?.id === parentId).length + 1
            : objectives.filter(o => !o.parent).length + 1;

          const newObjective: Objective = {
            id: crypto.randomUUID(),
            index,
            parent: parent ? { id: parent.id, index: parent.index } : null,
            title: objective.title || '',
            description: objective.description || '',
            verb: objective.verb || '',
            dimension: objective.dimension || '',
            taxonomyLevel: objective.taxonomyLevel,
            workloadHours: objective.workloadHours || 2,
            assessments: [{
              id: crypto.randomUUID(),
              type: 'formative',
              criteria: '',
              objectiveId: ''
            }]
          };

          console.log('Created new objective:', newObjective);

          objectives.push(newObjective);
          
          const updatedProject = {
            ...currentProject,
            objectives,
            totalWorkloadHours: objectives.reduce((total, obj) => total + obj.workloadHours, 0)
          };

          return {
            ...state,
            currentProject: updatedProject,
            projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
            selectedParentId: null
          };
        });
      },

      updateObjective: (objective: Objective) => {
        set((state) => {
          const currentProject = state.currentProject;
          if (!currentProject) return state;

          const objectives = currentProject.objectives.map(obj =>
            obj.id === objective.id 
              ? { 
                  ...obj, 
                  ...objective, 
                  taxonomyLevel: objective.taxonomyLevel || obj.taxonomyLevel 
                } 
              : obj
          );

          const updatedProject = {
            ...currentProject,
            objectives,
            totalWorkloadHours: objectives.reduce((total, obj) => total + obj.workloadHours, 0)
          };

          return {
            ...state,
            currentProject: updatedProject,
            projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
            editingObjective: null,
            isNewObjectiveModalOpen: false
          };
        });
      },

      removeObjective: (id) =>
        set((state) => {
          if (!state.currentProject) return state;

          const removeObjectiveAndChildren = (objectives: Objective[], id: string): Objective[] => {
            return objectives.reduce((acc, obj) => {
              if (obj.id === id) return acc;
              if (obj.children.includes(id)) {
                return [...acc, { ...obj, children: obj.children.filter((childId) => childId !== id) }];
              }
              return [...acc, obj];
            }, [] as Objective[]);
          };

          let updatedObjectives = removeObjectiveAndChildren(state.currentProject.objectives, id);
          updatedObjectives = updatedObjectives.filter((obj) => obj.parentId !== id);

          const totalWorkloadHours = updatedObjectives.reduce((total, obj) => total + obj.workloadHours, 0);

          const updatedProject = {
            ...state.currentProject,
            objectives: updatedObjectives,
            totalWorkloadHours,
          };

          return {
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
            currentProject: updatedProject,
          };
        }),

      // Requirement actions
      addRequirement: (requirement) =>
        set((state) => {
          if (!state.currentProject) return state;

          const newRequirement: Requirement = {
            ...requirement,
            id: requirement.id || crypto.randomUUID(),
            children: requirement.children || [],
            assessment: requirement.assessment || {
              id: crypto.randomUUID(),
              type: 'diagnostic',
              objectiveId: requirement.id || '',
              status: 'to_configure',
              successThreshold: 80,
              criteria: '',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            parentId: requirement.parentId || null,
            title: requirement.title || '',
            description: requirement.description || '',
            taxonomyLevel: requirement.taxonomyLevel || 1,
          };

          const updatedRequirements = [...(state.currentProject.requirements || [])];

          if (newRequirement.parentId) {
            const parentIndex = updatedRequirements.findIndex((req) => req.id === newRequirement.parentId);
            if (parentIndex !== -1) {
              updatedRequirements[parentIndex] = {
                ...updatedRequirements[parentIndex],
                children: [...updatedRequirements[parentIndex].children, newRequirement.id],
              };
            }
          }

          updatedRequirements.push(newRequirement);

          const updatedProject = {
            ...state.currentProject,
            requirements: updatedRequirements,
          };

          return {
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
            currentProject: updatedProject,
            selectedRequirementParentId: null,
            editingRequirement: null,
          };
        }),

      updateRequirement: (requirement) =>
        set((state) => {
          if (!state.currentProject) return state;

          const updatedRequirements = (state.currentProject.requirements || []).map((req) =>
            req.id === requirement.id ? requirement : req
          );

          const updatedProject = {
            ...state.currentProject,
            requirements: updatedRequirements,
          };

          return {
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
            currentProject: updatedProject,
            editingRequirement: null,
          };
        }),

      removeRequirement: (id) =>
        set((state) => {
          if (!state.currentProject) return state;

          const removeRequirementAndChildren = (requirements: Requirement[], id: string): Requirement[] => {
            return requirements.reduce((acc, req) => {
              if (req.id === id) return acc;
              if (req.children.includes(id)) {
                return [...acc, { ...req, children: req.children.filter((childId) => childId !== id) }];
              }
              return [...acc, req];
            }, [] as Requirement[]);
          };

          let updatedRequirements = removeRequirementAndChildren(state.currentProject.requirements || [], id);
          updatedRequirements = updatedRequirements.filter((req) => req.parentId !== id);

          const updatedProject = {
            ...state.currentProject,
            requirements: updatedRequirements,
          };

          return {
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
            currentProject: updatedProject,
          };
        }),

      setSelectedParentId: (id) => set({ selectedParentId: id }),
      setIsNewObjectiveModalOpen: (open: boolean) => set({ isNewObjectiveModalOpen: open }),
      setEditingObjective: (objective) => set({ editingObjective: objective }),
      setSelectedRequirementParentId: (id) => set({ selectedRequirementParentId: id }),
      setIsNewRequirementModalOpen: (open: boolean) => set({ isNewRequirementModalOpen: open }),
      setEditingRequirement: (requirement) => set({ editingRequirement: requirement }),

      // Module actions
      addModule: (projectId: string, moduleData: Partial<Module>) => {
        const state = get();
        if (!state.currentProject) return null;

        const newModule: Module = {
          id: crypto.randomUUID(),
          projectId: state.currentProject.id,
          title: moduleData.title || 'Nouveau module',
          description: moduleData.description || '',
          sequences: [],
          prerequisites: moduleData.prerequisites || [],
          objectives: moduleData.objectives || [],
          color: `hsl(${Math.random() * 360}, 85%, 75%)`
        };

        const updatedProject = {
          ...state.currentProject,
          modules: [...(state.currentProject.modules || []), newModule]
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });

        window.dispatchEvent(new CustomEvent('MODULE_UPDATED', { 
          detail: { modules: updatedProject.modules }
        }));

        return newModule;
      },

      updateModule: (projectId: string, moduleId: string, moduleData: Partial<Module>) => {
        const state = get();
        if (!state.currentProject) return;

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map(module =>
            module.id === moduleId
              ? { ...module, ...moduleData }
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });

        window.dispatchEvent(new CustomEvent('MODULE_UPDATED', {
          detail: { modules: updatedProject.modules }
        }));
      },

      deleteModule: (projectId: string, moduleId: string) => {
        const state = get();
        if (!state.currentProject) return;

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.filter(module => module.id !== moduleId)
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });

        window.dispatchEvent(new CustomEvent('MODULE_UPDATED', {
          detail: { modules: updatedProject.modules }
        }));
      },

      moveModule: (projectId: string, moduleId: string, newIndex: number) => {
        const state = get();
        if (!state.currentProject) return;

        const modules = [...state.currentProject.modules];
        const oldIndex = modules.findIndex(m => m.id === moduleId);
        if (oldIndex === -1) return;

        const [movedModule] = modules.splice(oldIndex, 1);
        modules.splice(newIndex, 0, movedModule);

        const updatedProject = {
          ...state.currentProject,
          modules
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });

        window.dispatchEvent(new CustomEvent('MODULE_UPDATED', {
          detail: { modules: updatedProject.modules }
        }));
      },

      // Sequence actions
      addSequence: (projectId: string, moduleId: string, sequenceData: Partial<Sequence>) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const newSequence: Sequence = {
          id: crypto.randomUUID(),
          title: sequenceData.title || '',
          description: sequenceData.description || '',
          courses: [],
          requirements: sequenceData.requirements || [],
          assessments: sequenceData.assessments || [],
        };

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { ...module, sequences: [...module.sequences, newSequence] } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },

      updateSequence: (projectId: string, moduleId: string, sequenceId: string, sequenceData: Partial<Sequence>) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const sequenceIndex = state.currentProject.modules[moduleIndex].sequences.findIndex(s => s.id === sequenceId);
        if (sequenceIndex === -1) return;

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { 
                ...module, 
                sequences: module.sequences.map((sequence, index) => 
                  index === sequenceIndex 
                    ? { ...sequence, ...sequenceData } 
                    : sequence
                ) 
              } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },

      deleteSequence: (projectId: string, moduleId: string, sequenceId: string) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { 
                ...module, 
                sequences: module.sequences.filter(s => s.id !== sequenceId) 
              } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },

      moveSequence: (projectId: string, moduleId: string, sequenceId: string, newIndex: number) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const sequences = [...state.currentProject.modules[moduleIndex].sequences];
        const oldIndex = sequences.findIndex(s => s.id === sequenceId);
        if (oldIndex === -1) return;

        const [movedSequence] = sequences.splice(oldIndex, 1);
        sequences.splice(newIndex, 0, movedSequence);

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { ...module, sequences } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },

      // Course actions
      addCourse: (projectId: string, moduleId: string, sequenceId: string, courseData: Partial<Course>) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const sequenceIndex = state.currentProject.modules[moduleIndex].sequences.findIndex(s => s.id === sequenceId);
        if (sequenceIndex === -1) return;

        const newCourse: Course = {
          id: crypto.randomUUID(),
          title: courseData.title || '',
          description: courseData.description || '',
          duration: courseData.duration || 0,
          requirements: courseData.requirements || [],
          assessments: courseData.assessments || [],
        };

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { 
                ...module, 
                sequences: module.sequences.map((sequence, index) => 
                  index === sequenceIndex 
                    ? { ...sequence, courses: [...sequence.courses, newCourse] } 
                    : sequence
                ) 
              } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },

      updateCourse: (projectId: string, moduleId: string, sequenceId: string, courseId: string, courseData: Partial<Course>) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const sequenceIndex = state.currentProject.modules[moduleIndex].sequences.findIndex(s => s.id === sequenceId);
        if (sequenceIndex === -1) return;

        const courseIndex = state.currentProject.modules[moduleIndex].sequences[sequenceIndex].courses.findIndex(c => c.id === courseId);
        if (courseIndex === -1) return;

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { 
                ...module, 
                sequences: module.sequences.map((sequence, index) => 
                  index === sequenceIndex 
                    ? { 
                      ...sequence, 
                      courses: sequence.courses.map((course, index) => 
                        index === courseIndex 
                          ? { ...course, ...courseData } 
                          : course
                      ) 
                    } 
                    : sequence
                ) 
              } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },

      deleteCourse: (projectId: string, moduleId: string, sequenceId: string, courseId: string) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const sequenceIndex = state.currentProject.modules[moduleIndex].sequences.findIndex(s => s.id === sequenceId);
        if (sequenceIndex === -1) return;

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { 
                ...module, 
                sequences: module.sequences.map((sequence, index) => 
                  index === sequenceIndex 
                    ? { 
                      ...sequence, 
                      courses: sequence.courses.filter(c => c.id !== courseId) 
                    } 
                    : sequence
                ) 
              } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },

      moveCourse: (projectId: string, moduleId: string, sequenceId: string, courseId: string, newIndex: number) => {
        const state = get();
        if (!state.currentProject) return;

        const moduleIndex = state.currentProject.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        const sequenceIndex = state.currentProject.modules[moduleIndex].sequences.findIndex(s => s.id === sequenceId);
        if (sequenceIndex === -1) return;

        const courses = [...state.currentProject.modules[moduleIndex].sequences[sequenceIndex].courses];
        const oldIndex = courses.findIndex(c => c.id === courseId);
        if (oldIndex === -1) return;

        const [movedCourse] = courses.splice(oldIndex, 1);
        courses.splice(newIndex, 0, movedCourse);

        const updatedProject = {
          ...state.currentProject,
          modules: state.currentProject.modules.map((module, index) => 
            index === moduleIndex 
              ? { 
                ...module, 
                sequences: module.sequences.map((sequence, index) => 
                  index === sequenceIndex 
                    ? { ...sequence, courses } 
                    : sequence
                ) 
              } 
              : module
          )
        };

        set({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          )
        });
      },
    }),
    {
      name: 'syllabus-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('Error rehydrating state:', error);
          } else if (rehydratedState) {
            // Ensure all required fields are present
            rehydratedState.projects = rehydratedState.projects?.map(project => ({
              ...project,
              modules: project.modules || [],
              objectives: project.objectives || [],
              requirements: project.requirements || [],
              totalWorkloadHours: project.totalWorkloadHours || 0
            })) || [];
          }
        };
      },
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject
      })
    }
  )
);

export default useStore;