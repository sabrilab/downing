import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/toast';

interface ProgramItemFormData {
  title: string;
  description: string;
  prerequisites: string[];
  objectives: string[];
}

interface ProgramItemDialogProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: ProgramItemFormData) => void;
  type: 'module' | 'sequence' | 'course';
  initialData?: ProgramItemFormData;
}

const programItemSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().min(1, 'La description est obligatoire'),
  prerequisites: z.array(z.string()),
  objectives: z.array(z.string()),
});

const typeLabels = {
  module: 'Module',
  sequence: 'Séquence',
  course: 'Cours',
};

export default function ProgramItemDialog({ 
  open,
  onClose,
  onOpenChange,
  onSubmit,
  type,
  initialData,
}: ProgramItemDialogProps) {
  const { toast } = useToast();
  const handleClose = () => {
    form.reset({
      title: '',
      description: '',
      prerequisites: [],
      objectives: []
    });
    if (onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const form = useForm<ProgramItemFormData>({
    resolver: zodResolver(programItemSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      prerequisites: [],
      objectives: [],
    },
  });

  const handleSubmit = async (data: ProgramItemFormData) => {
    console.log('submit triggered', data);
    try {
      await onSubmit(data);
      form.reset({
        title: '',
        description: '',
        prerequisites: [],
        objectives: []
      });
      if (onOpenChange) {
        onOpenChange(false);
      }
      toast.default({
        title: 'Succès',
        description: `${typeLabels[type]} créé avec succès`
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error({
        title: 'Erreur',
        description: `Une erreur est survenue lors de la création du ${typeLabels[type].toLowerCase()}`
      });
    }
  };

  const [newPrerequisite, setNewPrerequisite] = React.useState('');
  const [newObjective, setNewObjective] = React.useState('');

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      form.setValue('prerequisites', [...form.getValues('prerequisites'), newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      form.setValue('objectives', [...form.getValues('objectives'), newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removePrerequisite = (index: number) => {
    form.setValue('prerequisites', form.getValues('prerequisites').filter((_, i) => i !== index));
  };

  const removeObjective = (index: number) => {
    form.setValue('objectives', form.getValues('objectives').filter((_, i) => i !== index));
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Modifier' : 'Ajouter'} {typeLabels[type]}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                {...form.register('title', { required: 'Le titre est obligatoire' })}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description', { required: 'La description est obligatoire' })}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prérequis</Label>
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={e => setNewPrerequisite(e.target.value)}
                  placeholder="Ajouter un prérequis"
                />
                <Button 
                  type="button" 
                  onClick={addPrerequisite}
                >
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.getValues('prerequisites').map((prereq, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {prereq}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Objectifs</Label>
              <div className="flex gap-2">
                <Input
                  value={newObjective}
                  onChange={e => setNewObjective(e.target.value)}
                  placeholder="Ajouter un objectif"
                />
                <Button 
                  type="button" 
                  onClick={addObjective}
                >
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.getValues('objectives').map((obj, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {obj}
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit"
              className="ml-2 bg-black text-white hover:bg-gray-800"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Création...
                </div>
              ) : (
                initialData ? 'Mettre à jour' : 'Créer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
