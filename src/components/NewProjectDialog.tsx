import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import useStore from '@/store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (project: any) => void;
}

export default function NewProjectDialog({ open, onOpenChange, onSuccess }: Props) {
  const { addProject } = useStore();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [configureNow, setConfigureNow] = useState(true);
  const [totalHours, setTotalHours] = useState('');

  const progress = ((step + 1) / 2) * 100;

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const project = addProject(title, {
      description,
      totalHours: parseInt(totalHours) || 0,
    });

    handleClose();
    
    if (configureNow) {
      onSuccess(project);
    }
  };

  const handleClose = () => {
    setStep(0);
    setTitle('');
    setDescription('');
    setConfigureNow(true);
    setTotalHours('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="relative mb-6">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Project Title</Label>
                <Input
                  placeholder="Enter project title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Briefly describe your project..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(1)}
                disabled={!title.trim()}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Estimated Total Hours (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Enter total hours..."
                  value={totalHours}
                  onChange={e => setTotalHours(e.target.value)}
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Configure Now</Label>
                  <div className="text-sm text-muted-foreground">
                    Start setting up your project immediately
                  </div>
                </div>
                <Switch
                  checked={configureNow}
                  onCheckedChange={setConfigureNow}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(0)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                >
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}