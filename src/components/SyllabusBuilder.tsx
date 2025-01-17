import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Book, Cog, Sun, Moon, FileDown, Search, Files, Lightbulb, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme-provider';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import ObjectiveNode from './ObjectiveNode';
import ObjectiveGraph from './ObjectiveGraph';
import ObjectivesPanel from './ObjectivesPanel';
import NewObjectiveDialog from './NewObjectiveDialog';
import NewRequirementDialog from './NewRequirementDialog';
import TemplateDialog from './TemplateDialog';
import LearningDialog from './LearningDialog';
import NewProjectDialog from './NewProjectDialog';
import Logo from './Logo';
import useStore from '@/store';
import ProgramStructure from './ProgramStructure';
import ProgramItemDialog from './ProgramItemDialog';

export default function SyllabusBuilder() {
  const [view, setView] = useState<'projects' | 'editor'>('projects');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showLearningDialog, setShowLearningDialog] = useState(false);
  const [hoveredObjectiveId, setHoveredObjectiveId] = useState<string | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [programItemDialogState, setProgramItemDialogState] = useState<{
    open: boolean;
    type: 'module' | 'sequence' | 'course';
    mode: 'add' | 'edit';
    moduleId?: string;
    sequenceId?: string;
    itemId?: string;
  }>({
    open: false,
    type: 'module',
    mode: 'add'
  });
  const [activeTab, setActiveTab] = useState<'objectives' | 'program'>('objectives');

  const { theme, setTheme } = useTheme();
  const { 
    projects, 
    currentProject, 
    addProject, 
    setCurrentProject,
    isNewObjectiveModalOpen,
    setIsNewObjectiveModalOpen,
    isNewRequirementModalOpen,
    setIsNewRequirementModalOpen,
    addModule,
    updateModule,
    deleteModule,
    moveModule,
    addSequence,
    updateSequence,
    deleteSequence,
    moveSequence,
    addCourse,
    updateCourse,
    deleteCourse,
    moveCourse,
  } = useStore();

  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject, setCurrentProject]);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    setShowNewProjectDialog(true);
  };

  const handleAddModule = () => {
    console.log('SyllabusBuilder - handleAddModule', { 
      currentProject, 
      dialogState: programItemDialogState 
    });
    setProgramItemDialogState({
      open: true,
      type: 'module',
      mode: 'add'
    });
  };

  const handleAddSequence = (moduleId: string) => {
    setProgramItemDialogState({
      open: true,
      type: 'sequence',
      mode: 'add',
      moduleId
    });
  };

  const handleAddCourse = (moduleId: string, sequenceId: string) => {
    setProgramItemDialogState({
      open: true,
      type: 'course',
      mode: 'add',
      moduleId,
      sequenceId
    });
  };

  const handleEditItem = (type: 'module' | 'sequence' | 'course', moduleId: string, sequenceId?: string, itemId?: string) => {
    setProgramItemDialogState({
      open: true,
      type,
      mode: 'edit',
      moduleId,
      sequenceId,
      itemId
    });
  };

  const currentItem = () => {
    if (programItemDialogState.type === 'module' && programItemDialogState.moduleId) {
      return currentProject.modules.find(module => module.id === programItemDialogState.moduleId);
    } else if (programItemDialogState.type === 'sequence' && programItemDialogState.moduleId && programItemDialogState.sequenceId) {
      const module = currentProject.modules.find(module => module.id === programItemDialogState.moduleId);
      return module.sequences.find(sequence => sequence.id === programItemDialogState.sequenceId);
    } else if (programItemDialogState.type === 'course' && programItemDialogState.moduleId && programItemDialogState.sequenceId && programItemDialogState.itemId) {
      const module = currentProject.modules.find(module => module.id === programItemDialogState.moduleId);
      const sequence = module.sequences.find(sequence => sequence.id === programItemDialogState.sequenceId);
      return sequence.courses.find(course => course.id === programItemDialogState.itemId);
    }
  };

  const handleProgramItemSubmit = async (data: any) => {
    console.log('SyllabusBuilder - handleProgramItemSubmit:', { data, currentProject, dialogState: programItemDialogState });
    
    if (!currentProject) {
      console.error('SyllabusBuilder - Aucun projet sélectionné');
      return;
    }

    try {
      if (programItemDialogState.type === 'module') {
        console.log('SyllabusBuilder - Création d\'un module');
        const moduleData = {
          title: data.title,
          description: data.description,
          prerequisites: data.prerequisites || [],
          objectives: data.objectives || [],
          color: `hsl(${Math.random() * 360}, 85%, 75%)`,
        };

        const newModule = await addModule(currentProject.id, moduleData);
        console.log('SyllabusBuilder - Module créé:', newModule);
        
        if (newModule) {
          setProgramItemDialogState(prev => ({ ...prev, open: false }));
          setActiveTab('program');
        }
      }
    } catch (error) {
      console.error('SyllabusBuilder - Erreur lors de la création:', error);
      throw error;
    }
  };

  if (view === 'projects') {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-16 border-r border-border pt-5 pb-4 flex flex-col items-center">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <Logo />
          </div>
          <div className="flex-grow flex flex-col space-y-4">
            <Button 
              variant={view === 'projects' ? 'default' : 'ghost'} 
              className="w-full justify-center"
              onClick={() => setView('projects')}
            >
              <Book className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="w-full justify-center">
              <Cog className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-auto pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full h-10 hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full flex flex-col p-8">
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight">Welcome! 👋</h1>
                  <p className="text-xl text-muted-foreground">Create and manage your learning projects</p>
                </div>
                
                <div className="space-y-4 w-[400px]">
                  <Card 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    <CardContent className="p-6 flex items-center space-x-6">
                      <Files className="h-6 w-6" />
                      <div>
                        <h3 className="font-semibold">Use project template</h3>
                        <p className="text-sm text-muted-foreground">Start with a pre-built template</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setShowLearningDialog(true)}
                  >
                    <CardContent className="p-6 flex items-center space-x-6">
                      <Lightbulb className="h-6 w-6" />
                      <div>
                        <h3 className="font-semibold">Learn instructional design</h3>
                        <p className="text-sm text-muted-foreground">Best practices and guidelines</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <h2 className="text-2xl font-semibold">Your projects</h2>
                  <div className="relative w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {filteredProjects.map((project) => (
                      <CarouselItem key={project.id} className="basis-1/4 md:basis-1/4 lg:basis-1/5">
                        <Card 
                          className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => {
                            setCurrentProject(project);
                            setView('editor');
                          }}
                        >
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{project.totalWorkloadHours}h total</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {project.objectives.length} objectives
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                    <CarouselItem className="basis-1/4 md:basis-1/4 lg:basis-1/5">
                      <Card 
                        className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={handleCreateProject}
                      >
                        <CardContent className="p-6 flex items-center justify-center h-full">
                          <div className="text-center">
                            <Plus className="h-8 w-8 mx-auto mb-2" />
                            <span>New Project</span>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          </div>
        </div>

        <TemplateDialog 
          open={showTemplateDialog} 
          onOpenChange={setShowTemplateDialog} 
        />
        <LearningDialog 
          open={showLearningDialog} 
          onOpenChange={setShowLearningDialog} 
        />
        <NewProjectDialog
          open={showNewProjectDialog}
          onOpenChange={setShowNewProjectDialog}
          onSuccess={(project) => {
            setCurrentProject(project);
            setView('editor');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-16 border-r border-border pt-5 pb-4 flex flex-col items-center">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <Logo />
        </div>
        <div className="flex-grow flex flex-col space-y-4">
          <Button 
            variant="ghost"
            className="w-full justify-center"
            onClick={() => setView('projects')}
          >
            <Book className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="w-full justify-center">
            <Cog className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-auto pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full h-10 hover:bg-accent"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setView('projects')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Input
                value={currentProject?.name || ''}
                onChange={(e) => {
                  if (currentProject) {
                    setCurrentProject({
                      ...currentProject,
                      name: e.target.value
                    });
                  }
                }}
                className="text-xl font-semibold bg-transparent border-none focus-visible:ring-0 px-0 max-w-[300px]"
              />
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentProject?.totalWorkloadHours}h total workload
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle export
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'objectives' ? (
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={40} minSize={30}>
                  <div className="h-full p-6 overflow-auto">
                    {currentProject && (
                      <ObjectivesPanel 
                        project={currentProject}
                        onAddObjective={() => setIsNewObjectiveModalOpen(true)}
                        hoveredObjectiveId={hoveredObjectiveId}
                      />
                    )}
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={60} minSize={40}>
                  <div className="h-full p-6">
                    <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2] -z-10" />
                      {currentProject && (
                        <ObjectiveGraph 
                          project={currentProject} 
                          onObjectiveHover={setHoveredObjectiveId}
                        />
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <ProgramStructure
                onAddModule={handleAddModule}
                onAddSequence={handleAddSequence}
                onAddCourse={handleAddCourse}
                onEditModule={(moduleId) => handleEditItem('module', moduleId)}
                onEditSequence={(moduleId, sequenceId) => handleEditItem('sequence', moduleId, sequenceId)}
                onEditCourse={(moduleId, sequenceId, courseId) => handleEditItem('course', moduleId, sequenceId, courseId)}
              />
            )}
          </div>
        </div>
      </div>

      <NewObjectiveDialog 
        open={isNewObjectiveModalOpen} 
        onOpenChange={setIsNewObjectiveModalOpen}
      />
      <NewRequirementDialog
        open={isNewRequirementModalOpen}
        onOpenChange={setIsNewRequirementModalOpen}
      />
      <ProgramItemDialog
        open={programItemDialogState.open}
        onOpenChange={(open) => setProgramItemDialogState(prev => ({ ...prev, open }))}
        onSubmit={(data) => {
          handleProgramItemSubmit(data);
          setProgramItemDialogState(prev => ({ ...prev, open: false }));
        }}
        type={programItemDialogState.type}
        initialData={currentItem()}
      />
    </div>
  );
}