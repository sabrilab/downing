import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import { Assessment, AssessmentFormat, AssessmentCriterion } from '@/types';
import { assessmentLevels, knowledgeTypes } from '@/templates';
import useStore from '@/store';

interface Props {
  assessment: Assessment & { objective?: any };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getKnowledgeType = (level: string) => {
  if (knowledgeTypes.knowledge.levels.includes(level)) {
    return { type: knowledgeTypes.knowledge, variant: 'level1' as const };
  } else if (knowledgeTypes.skills.levels.includes(level)) {
    return { type: knowledgeTypes.skills, variant: 'level3' as const };
  } else {
    return { type: knowledgeTypes.abilities, variant: 'level6' as const };
  }
};

export default function AssessmentConfigDialog({ assessment, open, onOpenChange }: Props) {
  const { updateAssessment } = useStore();
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<AssessmentFormat | ''>(assessment.config?.format || '');
  const [realWorldMode, setRealWorldMode] = useState(assessment.config?.realWorldMode || false);
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>(assessment.config?.criteria || []);
  const [minimumCriteria, setMinimumCriteria] = useState(assessment.config?.minimumCriteria || 1);
  const [successThreshold, setSuccessThreshold] = useState(assessment.config?.successThreshold || 80);

  const knowledgeType = assessment.objective ? getKnowledgeType(assessment.objective.level) : null;
  const formats = knowledgeType?.type.formats || [];
  const allowsPerformanceThreshold = knowledgeType?.type.allowsPerformanceThreshold ?? false;
  const progress = (step / (allowsPerformanceThreshold ? 3 : 2)) * 100;

  const handleSave = () => {
    const updatedAssessment = {
      ...assessment,
      status: 'configured' as const,
      config: {
        format: format as AssessmentFormat,
        realWorldMode,
        criteria,
        minimumCriteria,
        successThreshold,
      },
    };

    updateAssessment(updatedAssessment);
    onOpenChange(false);
  };

  const handleClose = () => {
    setStep(1);
    setFormat(assessment.config?.format || '');
    setRealWorldMode(assessment.config?.realWorldMode || false);
    setCriteria(assessment.config?.criteria || []);
    setMinimumCriteria(assessment.config?.minimumCriteria || 1);
    setSuccessThreshold(assessment.config?.successThreshold || 80);
    onOpenChange(false);
  };

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        id: crypto.randomUUID(),
        description: '',
        essential: false,
        level: 1,
      },
    ]);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<AssessmentCriterion>) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configure Assessment
            {knowledgeType && (
              <Badge variant={knowledgeType.variant}>
                {knowledgeType.type.label}
              </Badge>
            )}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Configure assessment for objective: {assessment.objective?.verb} {assessment.objective?.dimensionText}
          </div>
        </DialogHeader>

        <div className="relative mb-6">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 1: Format Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Assessment Format</Label>
              <div className="grid grid-cols-2 gap-4">
                {formats.map(({ value, label, description }) => (
                  <Button
                    key={value}
                    variant={format === value ? 'default' : 'outline'}
                    className="justify-start h-auto p-4"
                    onClick={() => setFormat(value)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-muted-foreground">{description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {knowledgeType?.type === knowledgeTypes.abilities && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Real-world Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable for authentic assessment in real environments
                  </div>
                </div>
                <Switch
                  checked={realWorldMode}
                  onCheckedChange={setRealWorldMode}
                />
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!format}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Criteria */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Assessment Criteria</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCriterion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Criterion
                </Button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-start gap-4 p-4 bg-muted rounded-lg"
                  >
                    <div className="flex-1 space-y-4">
                      <Select
                        value={criterion.level.toString()}
                        onValueChange={(value) => updateCriterion(criterion.id, { level: parseInt(value) as 1 | 2 | 3 | 4 })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(assessmentLevels).map(([level, { label, description }]) => (
                            <SelectItem key={level} value={level}>
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-xs text-muted-foreground">{description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="Describe the criterion..."
                        value={criterion.description}
                        onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                        className="min-h-[100px]"
                      />

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={criterion.essential}
                          onCheckedChange={(checked) => updateCriterion(criterion.id, { essential: checked })}
                        />
                        <Label>Essential criterion</Label>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriterion(criterion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => allowsPerformanceThreshold ? setStep(3) : handleSave()}
              disabled={criteria.length === 0}
            >
              {allowsPerformanceThreshold ? 'Continue' : 'Save Configuration'}
            </Button>
          </div>
        )}

        {/* Step 3: Performance Thresholds (only for Skills and Competency) */}
        {allowsPerformanceThreshold && step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum Required Criteria</Label>
                <Select
                  value={minimumCriteria.toString()}
                  onValueChange={(value) => setMinimumCriteria(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: criteria.length }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} of {criteria.length} criteria
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Success Threshold (%)</Label>
                <Select
                  value={successThreshold.toString()}
                  onValueChange={(value) => setSuccessThreshold(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[60, 70, 80, 90].map((threshold) => (
                      <SelectItem key={threshold} value={threshold.toString()}>
                        {threshold}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
            >
              Save Configuration
            </Button>
          </div>
        )}

        {step > 1 && (
          <div className="mt-4 flex justify-start">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}