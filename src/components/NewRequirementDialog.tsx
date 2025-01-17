import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TaxonomyLevel, Dimension } from '@/types';
import useStore from '@/store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const taxonomyLevels: { level: TaxonomyLevel; label: string; description: string; number: number }[] = [
  { level: 'remembering', label: 'Remembering', description: 'Recall facts and basic concepts', number: 1 },
  { level: 'understanding', label: 'Understanding', description: 'Explain ideas or concepts', number: 2 },
  { level: 'applying', label: 'Applying', description: 'Use information in new situations', number: 3 },
  { level: 'analyzing', label: 'Analyzing', description: 'Draw connections among ideas', number: 4 },
  { level: 'evaluating', label: 'Evaluating', description: 'Justify a stand or decision', number: 5 },
  { level: 'creating', label: 'Creating', description: 'Produce new or original work', number: 6 }
];

const verbs: Record<TaxonomyLevel, string[]> = {
  remembering: [
    'Recall', 'Define', 'List', 'Name', 'Identify', 'State', 'Describe', 'Match',
    'Recognize', 'Label', 'Select', 'Outline', 'Reproduce', 'Arrange', 'Order',
    'Relate', 'Memorize', 'Repeat'
  ],
  understanding: [
    'Explain', 'Interpret', 'Summarize', 'Paraphrase', 'Classify', 'Compare',
    'Contrast', 'Discuss', 'Demonstrate', 'Illustrate', 'Infer', 'Relate',
    'Translate', 'Show', 'Indicate'
  ],
  applying: [
    'Apply', 'Use', 'Solve', 'Demonstrate', 'Calculate', 'Complete', 'Illustrate',
    'Show', 'Examine', 'Modify', 'Relate', 'Change', 'Classify', 'Experiment',
    'Discover'
  ],
  analyzing: [
    'Analyze', 'Compare', 'Contrast', 'Examine', 'Identify', 'Investigate',
    'Categorize', 'Differentiate', 'Distinguish', 'Test', 'Experiment',
    'Question', 'Solve', 'Inspect'
  ],
  evaluating: [
    'Evaluate', 'Judge', 'Select', 'Choose', 'Decide', 'Justify', 'Verify',
    'Recommend', 'Assess', 'Rate', 'Determine', 'Measure', 'Compare',
    'Value', 'Criticize'
  ],
  creating: [
    'Create', 'Design', 'Construct', 'Plan', 'Produce', 'Develop', 'Modify',
    'Combine', 'Compose', 'Formulate', 'Arrange', 'Build', 'Generate',
    'Organize', 'Propose'
  ]
};

const dimensions: { value: Dimension; label: string; description: string }[] = [
  { value: 'facts', label: 'Facts', description: 'Basic elements students must know' },
  { value: 'concepts', label: 'Concepts', description: 'Interrelationships among basic elements' },
  { value: 'processes', label: 'Processes', description: 'How something works or flows' },
  { value: 'procedures', label: 'Procedures', description: 'How to do something' },
  { value: 'principles', label: 'Principles', description: 'Guidelines, rules, or theories' },
  { value: 'metacognitive', label: 'Metacognitive', description: 'Knowledge about cognition in general' }
];

export default function NewRequirementDialog({ open, onOpenChange }: Props) {
  const { addRequirement, updateRequirement, selectedRequirementParentId, editingRequirement } = useStore();
  const [step, setStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<TaxonomyLevel | null>(null);
  const [selectedVerb, setSelectedVerb] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<Dimension | null>(null);
  const [dimensionText, setDimensionText] = useState('');
  const [verbFilter, setVerbFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editingRequirement) {
      setSelectedLevel(editingRequirement.level);
      setSelectedVerb(editingRequirement.verb);
      setSelectedDimension(editingRequirement.dimension);
      setDimensionText(editingRequirement.dimensionText);
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setStep(0);
    }
  }, [editingRequirement, open]);

  const progress = ((step + 1) / 3) * 100;

  const handleSubmit = () => {
    if (!selectedLevel || !selectedVerb || !selectedDimension || !dimensionText) return;

    const requirementData = {
      level: selectedLevel,
      verb: selectedVerb,
      dimension: selectedDimension,
      dimensionText,
      type: 'knowledge' as const,
      parentId: editingRequirement ? editingRequirement.parentId : selectedRequirementParentId,
      assessment: {
        id: crypto.randomUUID(),
        type: 'diagnostic' as const,
        objectiveId: crypto.randomUUID(),
        status: 'to_configure' as const,
        successThreshold: 80,
        criteria: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    if (editingRequirement) {
      updateRequirement({ 
        ...requirementData, 
        id: editingRequirement.id, 
        children: editingRequirement.children,
        assessment: editingRequirement.assessment
      });
    } else {
      addRequirement(requirementData);
    }

    handleClose();
  };

  const handleClose = () => {
    setStep(0);
    setSelectedLevel(null);
    setSelectedVerb('');
    setSelectedDimension(null);
    setDimensionText('');
    setVerbFilter('');
    setIsEditing(false);
    onOpenChange(false);
  };

  const selectedLevelInfo = taxonomyLevels.find(t => t.level === selectedLevel);
  const selectedDimensionInfo = dimensions.find(d => d.value === selectedDimension);

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Requirement</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Taxonomy Level Section */}
            <div className="space-y-2">
              <Label>Taxonomy Level</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedLevelInfo ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={`level${selectedLevelInfo.number}`}>
                          Level {selectedLevelInfo.number}
                        </Badge>
                        <span>{selectedLevelInfo.label}</span>
                      </div>
                    ) : (
                      'Select level'
                    )}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {taxonomyLevels.map(({ level, label, number }) => (
                    <DropdownMenuItem
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={`level${number}`}>Level {number}</Badge>
                        <span>{label}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Verb Section */}
            {selectedLevel && (
              <div className="space-y-2">
                <Label>Action Verb</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedVerb || 'Select verb'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
                      <Input
                        placeholder="Search verbs..."
                        value={verbFilter}
                        onChange={(e) => setVerbFilter(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {verbs[selectedLevel]
                      .filter(verb => verb.toLowerCase().includes(verbFilter.toLowerCase()))
                      .map((verb) => (
                        <DropdownMenuItem
                          key={verb}
                          onClick={() => setSelectedVerb(verb)}
                        >
                          {verb}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Dimension Section */}
            <div className="space-y-2">
              <Label>Knowledge Dimension</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedDimensionInfo?.label || 'Select dimension'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {dimensions.map(({ value, label, description }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setSelectedDimension(value)}
                    >
                      <div className="flex flex-col">
                        <span>{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what learners should already know or be able to do..."
                value={dimensionText}
                onChange={(e) => setDimensionText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedLevel || !selectedVerb || !selectedDimension || !dimensionText}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Entry Requirement</DialogTitle>
          <DialogDescription>
            {step === 0 && "Select the cognitive level of your requirement"}
            {step === 1 && "Choose an action verb"}
            {step === 2 && "Select the knowledge dimension and provide details"}
          </DialogDescription>
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

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="grid grid-cols-1 gap-4">
                {taxonomyLevels.map(({ level, icon: Icon, label, description, number }) => (
                  <Button
                    key={level}
                    variant="outline"
                    className={`justify-start h-auto py-4 ${selectedLevel === level ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => {
                      setSelectedLevel(level);
                      setStep(1);
                    }}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div className="text-left flex-grow">
                        <div className="font-medium flex items-center justify-between">
                          <span>{label}</span>
                          <Badge variant={`level${number}`}>Level {number}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {step === 1 && selectedLevel && (
              <div className="space-y-4">
                <Input
                  placeholder="Search verbs..."
                  value={verbFilter}
                  onChange={(e) => setVerbFilter(e.target.value)}
                  className="mb-4"
                />
                <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {verbs[selectedLevel]
                    .filter(verb => verb.toLowerCase().includes(verbFilter.toLowerCase()))
                    .map((verb) => (
                      <Button
                        key={verb}
                        variant="outline"
                        className={selectedVerb === verb ? 'ring-2 ring-primary' : ''}
                        onClick={() => {
                          setSelectedVerb(verb);
                          setStep(2);
                        }}
                      >
                        {verb}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {dimensions.map(({ value, label, description }) => (
                    <Button
                      key={value}
                      variant="outline"
                      className={`justify-start h-auto py-4 ${selectedDimension === value ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedDimension(value)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedDimension && (
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe what learners should already know or be able to do..."
                      value={dimensionText}
                      onChange={(e) => setDimensionText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button
                      className="w-full mt-4"
                      onClick={handleSubmit}
                      disabled={!dimensionText.trim()}
                    >
                      Add Requirement
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
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