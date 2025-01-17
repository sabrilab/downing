import React, { useState } from 'react';
import { ClipboardCheck, Settings, BookOpen, Hammer, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Assessment, Objective, Requirement } from '@/types';
import AssessmentConfigDialog from './AssessmentConfigDialog';
import { knowledgeTypes } from '@/templates';
import useStore from '@/store';

interface Props {
  objectives: Objective[];
  requirements: Requirement[];
}

function generateObjectiveNumber(objective: Objective, objectives: Objective[], parentNumber: string = ''): string {
  const siblings = objectives.filter(obj => obj.parentId === objective.parentId);
  const index = siblings.findIndex(obj => obj.id === objective.id) + 1;
  return parentNumber ? `${parentNumber}.${index}` : `O${index}`;
}

function generateRequirementNumber(requirement: Requirement, requirements: Requirement[], parentNumber: string = ''): string {
  const siblings = requirements.filter(req => req.parentId === requirement.parentId);
  const index = siblings.findIndex(req => req.id === requirement.id) + 1;
  return parentNumber ? `${parentNumber}.${index}` : `R${index}`;
}

const getKnowledgeType = (level: Objective['level']) => {
  if (knowledgeTypes.knowledge.levels.includes(level)) {
    return { type: knowledgeTypes.knowledge, icon: BookOpen, variant: 'level1' as const };
  } else if (knowledgeTypes.skills.levels.includes(level)) {
    return { type: knowledgeTypes.skills, icon: Hammer, variant: 'level3' as const };
  } else {
    return { type: knowledgeTypes.abilities, icon: Brain, variant: 'level6' as const };
  }
};

export default function AssessmentPanel({ objectives, requirements }: Props) {
  const { updateAssessment } = useStore();
  const [selectedAssessment, setSelectedAssessment] = useState<(Assessment & { objective?: Objective; requirement?: Requirement }) | null>(null);
  
  const objectiveAssessments = objectives?.flatMap(obj => 
    (obj.assessments || []).map(assessment => ({
      ...assessment,
      objective: obj,
      objectiveNumber: generateObjectiveNumber(obj, objectives),
    }))
  ).sort((a, b) => a.objectiveNumber.localeCompare(b.objectiveNumber)) || [];

  const requirementAssessments = requirements?.flatMap(req => 
    req.assessment ? [{
      ...req.assessment,
      requirement: req,
      requirementNumber: generateRequirementNumber(req, requirements),
    }] : []
  ).sort((a, b) => a.requirementNumber.localeCompare(b.requirementNumber)) || [];

  const unconfiguredObjectives = objectiveAssessments.filter(a => a.status === 'to_configure').length;
  const unconfiguredRequirements = requirementAssessments.filter(a => a.status === 'to_configure').length;

  const handleConfigure = (assessment: Assessment & { objective?: Objective; requirement?: Requirement }) => {
    setSelectedAssessment(assessment);
  };

  const renderAssessmentCard = (assessment: any, type: 'objective' | 'requirement') => {
    const item = type === 'objective' ? assessment.objective : assessment.requirement;
    const number = type === 'objective' ? assessment.objectiveNumber : assessment.requirementNumber;
    const knowledgeType = getKnowledgeType(item.level);
    const Icon = knowledgeType.icon;

    return (
      <Card key={assessment.id} className="relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-1 h-full"
          style={{
            backgroundColor: assessment.status === 'configured' 
              ? 'hsl(var(--primary))' 
              : 'hsl(var(--destructive))',
          }}
        />
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">
                  {number}
                </span>
                <Badge variant={assessment.status === 'configured' ? 'default' : 'destructive'}>
                  {assessment.type}
                </Badge>
                <Badge variant={knowledgeType.variant} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {knowledgeType.type.label}
                </Badge>
              </div>
              <div className="text-sm font-medium">
                {item.verb} {item.dimensionText}
              </div>
              {assessment.status === 'configured' && assessment.config && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Format: {assessment.config.format}</div>
                  {assessment.config.realWorldMode && (
                    <div>Real-world mode enabled</div>
                  )}
                  <div>
                    {assessment.config.criteria.length} criteria ({assessment.config.minimumCriteria} required)
                  </div>
                  <div>Success threshold: {assessment.config.successThreshold}%</div>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant={assessment.status === 'configured' ? 'outline' : 'default'}
              onClick={() => handleConfigure(assessment)}
            >
              {assessment.status === 'configured' ? (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Configure
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assessments</h2>
        <div className="flex gap-2">
          {unconfiguredObjectives > 0 && (
            <Badge variant="destructive">
              {unconfiguredObjectives} objectives unconfigured
            </Badge>
          )}
          {unconfiguredRequirements > 0 && (
            <Badge variant="destructive">
              {unconfiguredRequirements} requirements unconfigured
            </Badge>
          )}
        </div>
      </div>

      {/* Entry Requirements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Entry Requirements</h3>
          <Badge variant="secondary">{requirementAssessments.length} assessments</Badge>
        </div>
        <div className="space-y-4">
          {requirementAssessments.map(assessment => renderAssessmentCard(assessment, 'requirement'))}
          {requirementAssessments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No requirement assessments defined yet.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Learning Objectives Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Learning Objectives</h3>
          <Badge variant="secondary">{objectiveAssessments.length} assessments</Badge>
        </div>
        <div className="space-y-4">
          {objectiveAssessments.map(assessment => renderAssessmentCard(assessment, 'objective'))}
          {objectiveAssessments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No objective assessments defined yet.
            </div>
          )}
        </div>
      </div>

      {selectedAssessment && (
        <AssessmentConfigDialog
          assessment={selectedAssessment}
          open={!!selectedAssessment}
          onOpenChange={(open) => !open && setSelectedAssessment(null)}
        />
      )}
    </div>
  );
}