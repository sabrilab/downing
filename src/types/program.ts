export interface Course {
  id: string;
  title: string;
  duration: number; // in minutes
  description: string;
  objectives: string[]; // objective IDs
  requirements: string[]; // requirement IDs
  assessments: string[]; // assessment IDs
}

export interface Session {
  id: string;
  title: string;
  description: string;
  objectives: string[]; // objective IDs
  requirements: string[]; // requirement IDs
  assessments: string[]; // assessment IDs
  courses: Course[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  objectives: string[]; // objective IDs
  requirements: string[]; // requirement IDs
  assessments: string[]; // assessment IDs
  sessions: Session[];
  color: string;
}

export interface ModuleElement {
  id: string;
  type: 'objective' | 'requirement' | 'assessment';
  title: string;
  description?: string;
}
