import { z } from 'zod';

export type ModuleState = {
  isLoading: boolean;
  error: Error | null;
  items: Record<string, Module>;
  order: string[];
};

export type ModuleAction = 
  | { type: 'MODULE/ADD'; payload: Module }
  | { type: 'MODULE/UPDATE'; payload: { id: string; changes: Partial<Module> } }
  | { type: 'MODULE/DELETE'; payload: string }
  | { type: 'MODULE/REORDER'; payload: string[] }
  | { type: 'MODULE/SET_ERROR'; payload: Error }
  | { type: 'MODULE/START_LOADING' }
  | { type: 'MODULE/END_LOADING' };

export const moduleSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(1000),
  sequences: z.array(z.object({
    id: z.string().uuid()
  })),
  prerequisites: z.array(z.string()),
  objectives: z.array(z.string()),
  color: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Module = z.infer<typeof moduleSchema>;
