import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TaxonomyLevel } from '@/types';
import { taxonomyConfig } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import useStore from '@/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const taxonomyLevels = Object.entries(taxonomyConfig).map(([key, value]) => ({
  level: key as TaxonomyLevel,
  label: value.label,
  description: value.description,
  number: value.level,
}));

export default function NewObjectiveModal({ isOpen, onClose }: Props) {
  const { addObjective, setIsNewObjectiveModalOpen } = useStore();
  const [selectedLevel, setSelectedLevel] = useState<TaxonomyLevel | null>(null);
  const [verb, setVerb] = useState('');
  const [dimension, setDimension] = useState('');
  const [description, setDescription] = useState('');
  const [workloadHours, setWorkloadHours] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission - Selected Level:', selectedLevel);
    
    if (!selectedLevel) {
      console.error('No taxonomy level selected');
      return;
    }

    const objective: Partial<Objective> = {
      taxonomyLevel: selectedLevel,
      verb,
      dimension,
      description,
      workloadHours: Number(workloadHours)
    };

    console.log('Submitting objective:', objective);
    
    addObjective(objective);
    handleClose();
  };

  const handleClose = () => {
    setSelectedLevel(null);
    setVerb('');
    setDimension('');
    setDescription('');
    setWorkloadHours(2);
    setIsNewObjectiveModalOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Learning Objective</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h3 className="mb-4 text-lg font-medium">Select the cognitive level of your objective</h3>
            <div className="space-y-2">
              {taxonomyLevels.map(({ level, label, description, number }) => {
                const IconComponent = taxonomyConfig[level].icon;
                return (
                  <div
                    key={level}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedLevel === level ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    )}
                    onClick={() => setSelectedLevel(level)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        selectedLevel === level ? taxonomyConfig[level].color : "bg-muted"
                      )}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-xs",
                      taxonomyConfig[level].color
                    )}>
                      Level {number}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedLevel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="verb" className="text-sm font-medium">Verb</label>
                  <Input
                    id="verb"
                    value={verb}
                    onChange={(e) => setVerb(e.target.value)}
                    placeholder="e.g., Analyze, Evaluate, Create"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dimension" className="text-sm font-medium">Dimension</label>
                  <Input
                    id="dimension"
                    value={dimension}
                    onChange={(e) => setDimension(e.target.value)}
                    placeholder="e.g., processes, concepts, principles"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the objective in detail..."
                  className="h-24"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="workload" className="text-sm font-medium">Workload Hours</label>
                <Input
                  id="workload"
                  type="number"
                  min={1}
                  value={workloadHours}
                  onChange={(e) => setWorkloadHours(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedLevel || !verb || !dimension}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
