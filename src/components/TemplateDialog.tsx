import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, ChevronRight } from 'lucide-react';
import { templates } from '@/templates';
import useStore from '@/store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TemplateDialog({ open, onOpenChange }: Props) {
  const { addProject } = useStore();

  const handleSelectTemplate = (template: typeof templates[0]) => {
    addProject(template.name, template);
    onOpenChange(false);
  };

  const calculateTotalObjectives = (template: typeof templates[0]) => {
    return template.objectives.reduce((total, obj) => 
      total + 1 + (obj.subObjectives?.length || 0), 0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Project Templates</DialogTitle>
          <DialogDescription>
            Choose a template to quickly start your project with predefined learning objectives
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleSelectTemplate(template)}
              style={{ borderLeftColor: template.color, borderLeftWidth: '4px' }}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{template.totalHours} hours total</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4" />
                    <span>{calculateTotalObjectives(template)} objectives</span>
                  </div>

                  <div className="space-y-2">
                    {template.objectives.map((obj, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {obj.workloadHours}h
                          </Badge>
                          <span>{obj.verb} {obj.dimensionText}</span>
                        </div>
                        {obj.subObjectives && obj.subObjectives.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {obj.subObjectives.map((subObj, subIndex) => (
                              <div key={subIndex} className="flex items-center gap-2 text-muted-foreground">
                                <ChevronRight className="h-3 w-3" />
                                <Badge variant="outline" className="text-xs">
                                  {subObj.workloadHours}h
                                </Badge>
                                <span>{subObj.verb}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}