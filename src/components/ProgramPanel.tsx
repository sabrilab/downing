import React, { useState } from 'react';
import { Plus, ChevronRight, MoreVertical, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Module, Session, Course, ModuleElement } from '@/types/program';
import { Project, TaxonomyLevel } from '@/types';
import useStore from '@/store';
import { cn } from '@/lib/utils';

interface Props {
  project: Project;
}

const taxonomyColors: Record<TaxonomyLevel, string> = {
  remembering: 'bg-blue-100 text-blue-800',
  understanding: 'bg-green-100 text-green-800',
  applying: 'bg-yellow-100 text-yellow-800',
  analyzing: 'bg-orange-100 text-orange-800',
  evaluating: 'bg-purple-100 text-purple-800',
  creating: 'bg-pink-100 text-pink-800',
};

const taxonomyLabels: Record<TaxonomyLevel, string> = {
  remembering: 'L1',
  understanding: 'L2',
  applying: 'L3',
  analyzing: 'L4',
  evaluating: 'L5',
  creating: 'L6',
};

const ModuleCard = ({ module, isExpanded, onToggle, children }: { 
  module: Module; 
  isExpanded: boolean; 
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <Card className="mb-4 border-l-4 transition-all hover:shadow-md" style={{ borderLeftColor: module.color }}>
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={onToggle}
          >
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
          <div>
            <CardTitle className="text-lg font-semibold">{module.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-1">
              {module.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {module.objectives.length > 0 && (
            <Badge variant="secondary" className="h-6">
              {module.objectives.length} objectifs
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
    {isExpanded && (
      <CardContent className="p-4 pt-0">
        {children}
      </CardContent>
    )}
  </Card>
);

const SessionCard = ({ session, isExpanded, onToggle, children }: {
  session: Session;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <Card className="mb-3 bg-muted/30 hover:bg-muted/50 transition-colors">
    <CardHeader className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={onToggle}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <div>
            <CardTitle className="text-base font-medium">{session.title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-1">
              {session.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.objectives.length > 0 && (
            <Badge variant="secondary" className="h-5 text-xs">
              {session.objectives.length} objectifs
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
    {isExpanded && (
      <CardContent className="p-3 pt-0">
        {children}
      </CardContent>
    )}
  </Card>
);

const CourseCard = ({ course }: { course: Course }) => (
  <Card className="mb-2 bg-background hover:bg-muted/30 transition-colors">
    <CardHeader className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <CardTitle className="text-sm font-medium">{course.title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-1">
              {course.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-5">
            <Clock className="h-3 w-3 mr-1" />
            {course.duration}min
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default function ProgramPanel({ project }: Props) {
  const [isNewModuleOpen, setIsNewModuleOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { currentProject, addModule, addSession, addCourse } = useStore();

  // Si currentProject n'existe pas, ne rien afficher
  if (!currentProject) {
    return null;
  }

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    selectedElements: new Set<string>()
  });

  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    selectedElements: new Set<string>()
  });

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    duration: 60,
    selectedElements: new Set<string>()
  });

  const getElementNumber = (element: ModuleElement): string => {
    if (!currentProject) return '';
    
    if (element.type === 'objective') {
      const obj = currentProject.objectives.find(o => o.id === element.id);
      if (!obj) return '';
      const index = currentProject.objectives.findIndex(o => o.id === element.id) + 1;
      return `O${index}`;
    } else if (element.type === 'requirement') {
      const req = currentProject.requirements.find(r => r.id === element.id);
      if (!req) return '';
      const index = currentProject.requirements.findIndex(r => r.id === element.id) + 1;
      return `R${index}`;
    }
    return '';
  };

  const getObjectiveTaxonomyLevel = (objectiveId: string): TaxonomyLevel | null => {
    if (!currentProject) return null;
    const objective = currentProject.objectives.find(o => o.id === objectiveId);
    return objective?.taxonomyLevel || null;
  };

  const getSelectableElements = (moduleId?: string, sessionId?: string): ModuleElement[] => {
    if (!currentProject) return [];
    const elements: ModuleElement[] = [];
    
    if (moduleId && sessionId) {
      // Pour un cours, montrer seulement les éléments de la session parente
      const module = currentProject.modules?.find(m => m.id === moduleId);
      const session = module?.sessions?.find(s => s.id === sessionId);
      if (session) {
        session.objectives.forEach(objId => {
          const obj = currentProject.objectives.find(o => o.id === objId);
          if (obj) {
            elements.push({
              id: obj.id,
              type: 'objective',
              title: `${obj.verb} ${obj.dimensionText}`,
              description: obj.description
            });
          }
        });
      }
    } else if (moduleId) {
      // Pour une session, montrer seulement les éléments du module parent
      const module = currentProject.modules?.find(m => m.id === moduleId);
      if (module) {
        module.objectives.forEach(objId => {
          const obj = currentProject.objectives.find(o => o.id === objId);
          if (obj) {
            elements.push({
              id: obj.id,
              type: 'objective',
              title: `${obj.verb} ${obj.dimensionText}`,
              description: obj.description
            });
          }
        });
      }
    } else {
      // Pour un nouveau module, montrer tous les éléments
      currentProject.objectives.forEach(obj => {
        elements.push({
          id: obj.id,
          type: 'objective',
          title: `${obj.verb} ${obj.dimensionText}`,
          description: obj.description
        });
        obj.assessments.forEach(assessment => {
          elements.push({
            id: assessment.id,
            type: 'assessment',
            title: `Assessment: ${assessment.type}`,
            description: assessment.criteria
          });
        });
      });

      currentProject.requirements.forEach(req => {
        elements.push({
          id: req.id,
          type: 'requirement',
          title: req.text,
          description: req.description
        });
      });
    }

    return elements;
  };

  const renderElementBadge = (element: ModuleElement) => {
    const number = getElementNumber(element);
    const taxonomyLevel = element.type === 'objective' ? getObjectiveTaxonomyLevel(element.id) : null;
    
    return (
      <div key={element.id} className="flex items-center gap-1 mb-2">
        <Badge variant="outline" className="text-xs font-mono">
          {number}
        </Badge>
        <Badge 
          variant="secondary"
          className={cn(
            "text-xs",
            element.type === 'objective' && taxonomyLevel && taxonomyColors[taxonomyLevel]
          )}
        >
          {element.type === 'objective' && taxonomyLevel && taxonomyLabels[taxonomyLevel]}
          {element.title}
        </Badge>
      </div>
    );
  };

  // ... (autres fonctions de gestion existantes)

  const handleCreateSession = () => {
    if (!activeModuleId) return;

    const session: Session = {
      id: crypto.randomUUID(),
      title: newSession.title,
      description: newSession.description,
      objectives: Array.from(newSession.selectedElements),
      requirements: [],
      assessments: [],
      courses: []
    };

    addSession(activeModuleId, session);
    setIsNewSessionOpen(false);
    setNewSession({ title: '', description: '', selectedElements: new Set() });
  };

  const handleCreateCourse = () => {
    if (!activeModuleId || !activeSessionId) return;

    const course: Course = {
      id: crypto.randomUUID(),
      title: newCourse.title,
      description: newCourse.description,
      duration: newCourse.duration,
      objectives: Array.from(newCourse.selectedElements),
      requirements: [],
      assessments: []
    };

    addCourse(activeModuleId, activeSessionId, course);
    setIsNewCourseOpen(false);
    setNewCourse({ title: '', description: '', duration: 60, selectedElements: new Set() });
  };

  const handleCreateModule = () => {
    const module: Module = {
      id: crypto.randomUUID(),
      title: newModule.title,
      description: newModule.description,
      objectives: Array.from(newModule.selectedElements),
      requirements: [],
      assessments: [],
      sessions: []
    };

    addModule(module);
    setIsNewModuleOpen(false);
    setNewModule({ title: '', description: '', selectedElements: new Set() });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Programme</h2>
        <Button onClick={() => setIsNewModuleOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau module
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
        {currentProject.modules?.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isExpanded={expandedModules.has(module.id)}
            onToggle={() => handleModuleToggle(module.id)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddSession(module.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              </div>

              {module.sessions?.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedSessions.has(session.id)}
                  onToggle={() => handleSessionToggle(session.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-muted-foreground">Cours</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddCourse(module.id, session.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>

                    {session.courses?.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </SessionCard>
              ))}
            </div>
          </ModuleCard>
        ))}
      </ScrollArea>

      {/* Modal pour créer un module */}
      <Dialog open={isNewModuleOpen} onOpenChange={setIsNewModuleOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogDescription>
              Create a new module and select relevant objectives and requirements
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Colonne de gauche : informations du module */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="module-title">Title</Label>
                <Input
                  id="module-title"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  className="h-[150px]"
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                />
              </div>
            </div>

            {/* Colonne de droite : sélection des éléments */}
            <div className="border rounded-lg p-4">
              <Label className="mb-2 block">Select Elements</Label>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Section Objectifs */}
                  <div>
                    <h3 className="font-semibold mb-2">Objectives</h3>
                    <div className="space-y-3">
                      {currentProject.objectives?.map((objective) => {
                        const assessments = objective.assessments || [];
                        return (
                          <div key={objective.id} className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <Checkbox
                                id={objective.id}
                                checked={newModule.selectedElements.has(objective.id)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(newModule.selectedElements);
                                  if (checked) {
                                    // Sélectionner l'objectif et ses évaluations
                                    newSelected.add(objective.id);
                                    assessments.forEach(assessment => {
                                      newSelected.add(assessment.id);
                                    });
                                  } else {
                                    // Désélectionner l'objectif et ses évaluations
                                    newSelected.delete(objective.id);
                                    assessments.forEach(assessment => {
                                      newSelected.delete(assessment.id);
                                    });
                                  }
                                  setNewModule({ ...newModule, selectedElements: newSelected });
                                }}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {`O${objective.parent ? objective.parent.index + '.' + objective.index : objective.index}`}
                                  </Badge>
                                  <Badge 
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      taxonomyColors[objective.taxonomyLevel]
                                    )}
                                  >
                                    {`${objective.verb} (${objective.dimension})`}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {objective.workloadHours}h
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {objective.description}
                                </p>
                                {/* Afficher les évaluations associées */}
                                <div className="pl-4 space-y-1">
                                  {assessments.map(assessment => (
                                    <div key={assessment.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Badge variant="outline" className="text-[10px]">
                                        {assessment.type}
                                      </Badge>
                                      <span>{assessment.criteria}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Prérequis */}
                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <div className="space-y-3">
                      {currentProject.requirements?.map((requirement) => (
                        <div key={requirement.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={requirement.id}
                            checked={newModule.selectedElements.has(requirement.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(newModule.selectedElements);
                              if (checked) {
                                newSelected.add(requirement.id);
                                if (requirement.assessment) {
                                  newSelected.add(requirement.assessment.id);
                                }
                              } else {
                                newSelected.delete(requirement.id);
                                if (requirement.assessment) {
                                  newSelected.delete(requirement.assessment.id);
                                }
                              }
                              setNewModule({ ...newModule, selectedElements: newSelected });
                            }}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {requirement.parent 
                                  ? `R${requirement.parent.index}.${requirement.index}`
                                  : `R${requirement.index}`}
                              </Badge>
                              <Badge 
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  taxonomyColors[requirement.taxonomyLevel]
                                )}
                              >
                                {requirement.verb} ({requirement.dimension})
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {requirement.description}
                            </p>
                            {/* Afficher l'évaluation associée */}
                            {requirement.assessment && (
                              <div className="pl-4">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-[10px]">
                                    {requirement.assessment.type}
                                  </Badge>
                                  {requirement.assessment.criteria}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateModule}>Create Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour créer une session */}
      <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Create a new session and select relevant objectives
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session-title">Title</Label>
              <Input
                id="session-title"
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="session-description">Description</Label>
              <Textarea
                id="session-description"
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Select Objectives</Label>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-2">
                  {getSelectableElements(activeModuleId).map((element) => (
                    <div key={element.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={element.id}
                        checked={newSession.selectedElements.has(element.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(newSession.selectedElements);
                          if (checked) {
                            newSelected.add(element.id);
                          } else {
                            newSelected.delete(element.id);
                          }
                          setNewSession({ ...newSession, selectedElements: newSelected });
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        {renderElementBadge(element)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateSession}>Create Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour créer un cours */}
      <Dialog open={isNewCourseOpen} onOpenChange={setIsNewCourseOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Create a new course and select relevant objectives
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course-title">Title</Label>
              <Input
                id="course-title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-duration">Duration (minutes)</Label>
              <Input
                id="course-duration"
                type="number"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) || 60 })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Select Objectives</Label>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-2">
                  {getSelectableElements(activeModuleId, activeSessionId).map((element) => (
                    <div key={element.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={element.id}
                        checked={newCourse.selectedElements.has(element.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(newCourse.selectedElements);
                          if (checked) {
                            newSelected.add(element.id);
                          } else {
                            newSelected.delete(element.id);
                          }
                          setNewCourse({ ...newCourse, selectedElements: newSelected });
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        {renderElementBadge(element)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
