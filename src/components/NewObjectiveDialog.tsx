import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Brain, BookOpen, Hammer, Search, Scale, Lightbulb, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaxonomyLevel, Dimension, Objective } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import useStore from '@/store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const taxonomyLevels: { level: TaxonomyLevel; icon: typeof Brain; label: string; description: string; number: number }[] = [
  { level: 'remembering', icon: Brain, label: 'Remembering', description: 'Recall facts and basic concepts', number: 1 },
  { level: 'understanding', icon: BookOpen, label: 'Understanding', description: 'Explain ideas or concepts', number: 2 },
  { level: 'applying', icon: Hammer, label: 'Applying', description: 'Use information in new situations', number: 3 },
  { level: 'analyzing', icon: Search, label: 'Analyzing', description: 'Draw connections among ideas', number: 4 },
  { level: 'evaluating', icon: Scale, label: 'Evaluating', description: 'Justify a stand or decision', number: 5 },
  { level: 'creating', icon: Lightbulb, label: 'Creating', description: 'Produce new or original work', number: 6 }
];

const verbs: Record<TaxonomyLevel, string[]> = {
  remembering: [
    'Tell', 'Acquire', 'Arrange', 'Associate', 'Cite', 'Copy', 'Describe', 'Define',
    'Designate', 'Distinguish', 'Record', 'Enumerate', 'Label', 'Examine', 'Identify',
    'Indicate', 'List', 'Memorize', 'Show', 'Name', 'Order', 'Recall', 'Recite',
    'Repeat', 'Reproduce', 'Retain', 'Select', 'Specify', 'Catalog', 'Say'
  ],
  understanding: [
    'Associate', 'Change', 'Classify', 'Compare', 'Complete', 'Conclude', 'Convert',
    'Describe', 'Demonstrate', 'Determine', 'Differentiate', 'Discuss', 'Distinguish',
    'Estimate', 'Establish', 'Explain', 'Express', 'Extrapolate', 'Do', 'Identify',
    'Illustrate', 'Infer', 'Interpolate', 'Interpret', 'Locate', 'Order', 'Paraphrase',
    'Specify', 'Predict', 'Prepare', 'Report', 'Rearrange', 'Redefine', 'Rewrite',
    'Group', 'Reorganize', 'Represent', 'Summarize', 'Select', 'Situate', 'Translate',
    'Transform'
  ],
  applying: [
    'Act', 'Adapt', 'Apply', 'Calculate', 'Choose', 'Classify', 'Categorize',
    'Complete', 'Build', 'Control', 'Demonstrate', 'Develop', 'Employ', 'Experiment',
    'Generalize', 'Manage', 'Illustrate', 'Inform', 'Interpret', 'Play', 'Manipulate',
    'Modify', 'Operate', 'Organize', 'Plan', 'Practice', 'Write', 'Connect', 'Solve',
    'Restructure', 'Diagram', 'Simulate', 'Process', 'Transfer', 'Use'
  ],
  analyzing: [
    'Analyze', 'Arrange', 'Categorize', 'Choose', 'Classify', 'Compare', 'Contrast',
    'Correlate', 'Critique', 'Decompose', 'Deduce', 'Delimit', 'Detect', 'Differentiate',
    'Discriminate', 'Distinguish', 'Divide', 'Examine', 'Experiment', 'Explain',
    'Identify', 'Infer', 'Interpret', 'Model', 'Qualify', 'Organize', 'Search',
    'Connect', 'Separate', 'Subdivide', 'Test'
  ],
  evaluating: [
    'Appreciate', 'Support', 'Argue', 'Choose', 'Classify', 'Compare', 'Conclude',
    'Consider', 'Contrast', 'Convince', 'Critique', 'Decide', 'Deduce', 'Defend',
    'Estimate', 'Evaluate', 'Explain', 'Judge', 'Justify', 'Measure', 'Grade',
    'Persuade', 'Predict', 'Reframe', 'Recommend', 'Summarize', 'Select',
    'Standardize', 'Test', 'Validate'
  ],
  creating: [
    'Anticipate', 'Arrange', 'Assemble', 'Classify', 'Collect', 'Combine', 'Compile',
    'Compose', 'Conceive', 'Constitute', 'Build', 'Create', 'Deduce', 'Derive',
    'Develop', 'Discuss', 'Write', 'Elaborate', 'Formulate', 'Generalize', 'Imagine',
    'Integrate', 'Invent', 'Modify', 'Organize', 'Plan', 'Prepare', 'Produce',
    'Project', 'Propose', 'Tell', 'Relate', 'Reorganize', 'Diagram', 'Support',
    'Specify', 'Structure', 'Substitute', 'Synthesize', 'Transmit'
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

export default function NewObjectiveDialog({ open, onOpenChange }: Props) {
  const { addObjective, updateObjective, selectedParentId, editingObjective } = useStore();
  const [step, setStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<TaxonomyLevel | null>(null);
  const [selectedVerb, setSelectedVerb] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<Dimension | null>(null);
  const [dimensionText, setDimensionText] = useState('');
  const [verbFilter, setVerbFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editingObjective) {
      setSelectedLevel(editingObjective.level);
      setSelectedVerb(editingObjective.verb);
      setSelectedDimension(editingObjective.dimension);
      setDimensionText(editingObjective.dimensionText);
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setStep(0);
    }
  }, [editingObjective, open]);

  const progress = ((step + 1) / 3) * 100;

  const handleSubmit = () => {
    if (!selectedLevel || !selectedVerb || !selectedDimension || !dimensionText) return;

    console.log('Creating objective with:', { selectedLevel, selectedVerb, selectedDimension, dimensionText });

    const objectiveData = {
      taxonomyLevel: selectedLevel,
      verb: selectedVerb,
      dimension: selectedDimension,
      description: dimensionText,
      parentId: editingObjective ? editingObjective.parentId : selectedParentId,
      workloadHours: 2,
    };

    console.log('Objective data:', objectiveData);

    if (editingObjective) {
      updateObjective({ ...objectiveData, id: editingObjective.id });
    } else {
      addObjective(objectiveData);
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

  if (isEditing) {
    const selectedLevelInfo = taxonomyLevels.find(t => t.level === selectedLevel);
    const selectedDimensionInfo = dimensions.find(d => d.value === selectedDimension);
    const Icon = selectedLevelInfo?.icon || Brain;

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Learning Objective</DialogTitle>
            <DialogDescription>
              Click on any element to modify it
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Taxonomy Level Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxonomy Level</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <Badge variant={`level${selectedLevelInfo?.number}`}>
                          Level {selectedLevelInfo?.number}
                        </Badge>
                        <span>{selectedLevelInfo?.label}</span>
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {taxonomyLevels.map(({ level, icon: LevelIcon, label, number }) => (
                      <DropdownMenuItem
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                      >
                        <div className="flex items-center gap-2">
                          <LevelIcon className="h-4 w-4" />
                          <Badge variant={`level${number}`}>Level {number}</Badge>
                          <span>{label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Verb Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Action Verb</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
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
                    {selectedLevel && verbs[selectedLevel]
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
            </div>

            {/* Dimension Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Knowledge Dimension</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      {selectedDimensionInfo?.label || 'Select dimension'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {dimensions.map(({ value, label }) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => setSelectedDimension(value)}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Description</span>
              <Textarea
                placeholder="Describe what the student should know or be able to do..."
                value={dimensionText}
                onChange={(e) => setDimensionText(e.target.value)}
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
          <DialogTitle>Create Learning Objective</DialogTitle>
          <DialogDescription>
            {step === 0 && "Select the cognitive level of your objective"}
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
                      <div className="p-2 rounded bg-primary/10">
                        <Icon className="h-5 w-5" />
                      </div>
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
                    <Textarea
                      placeholder="Describe what the student should know or be able to do..."
                      value={dimensionText}
                      onChange={(e) => setDimensionText(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={!dimensionText.trim()}
                    >
                      Create Objective
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