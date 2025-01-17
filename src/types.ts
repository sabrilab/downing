// ... existing types ...

export type TaxonomyLevel = 'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  totalWorkloadHours: number;
  modules: Module[];
  objectives: Objective[];
  requirements: Requirement[];
}

export interface Parent {
  id: string;
  index: number;
}

export interface Objective {
  id: string;
  index: number;
  parent: Parent | null;
  title: string;
  description: string;
  verb: string;
  dimension: string;
  taxonomyLevel: TaxonomyLevel;
  workloadHours: number;
  assessments: Assessment[];
}

export interface Assessment {
  id: string;
  type: 'formative' | 'summative';
  criteria: string;
  objectiveId: string;
}

export interface Requirement {
  id: string;
  index: number;
  parent: Parent | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  workloadHours: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  sequences: Sequence[];
  prerequisites: string[];
  objectives: string[]; // IDs of objectives
}

export interface Sequence {
  id: string;
  title: string;
  description: string;
  courses: Course[];
  prerequisites: string[];
  objectives: string[]; // IDs of objectives
}

export interface Course {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  objectives: string[]; // IDs of objectives
  resources: Resource[];
  assessments: Assessment[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'other';
  url: string;
}

// Store interfaces
export interface ProjectStore {
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
  setCurrentProject: (project: Project | null) => void;

  // Objective actions
  addObjective: (objective: Partial<Objective>) => void;
  updateObjective: (objective: Objective) => void;
  removeObjective: (id: string) => void;
  duplicateObjective: (objective: Objective) => void;
  setSelectedParentId: (id: string | null) => void;
  setIsNewObjectiveModalOpen: (open: boolean) => void;
  setEditingObjective: (objective: Objective | null) => void;

  // Requirement actions
  addRequirement: (requirement: Partial<Requirement>) => void;
  updateRequirement: (requirement: Requirement) => void;
  removeRequirement: (id: string) => void;
  duplicateRequirement: (requirement: Requirement) => void;
  setSelectedRequirementParentId: (id: string | null) => void;
  setIsNewRequirementModalOpen: (open: boolean) => void;
  setEditingRequirement: (requirement: Requirement | null) => void;
}