import useStore from '@/store';

export const useModuleActions = () => {
  const store = useStore();

  const handleAddModule = async (moduleData: any) => {
    if (!store.currentProject) {
      console.error('Pas de projet sélectionné');
      return null;
    }

    try {
      const newModule = await store.addModule(store.currentProject.id, moduleData);
      console.log('Module créé:', newModule);
      return newModule;
    } catch (error) {
      console.error('Erreur lors de la création du module:', error);
      return null;
    }
  };

  const handleUpdateModule = async (moduleId: string, moduleData: any) => {
    if (!store.currentProject) {
      console.error('Pas de projet sélectionné');
      return;
    }

    try {
      await store.updateModule(store.currentProject.id, moduleId, moduleData);
      console.log('Module mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du module:', error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!store.currentProject) {
      console.error('Pas de projet sélectionné');
      return;
    }

    try {
      await store.deleteModule(store.currentProject.id, moduleId);
      console.log('Module supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du module:', error);
    }
  };

  const handleMoveModule = async (moduleId: string, newIndex: number) => {
    if (!store.currentProject) {
      console.error('Pas de projet sélectionné');
      return;
    }

    try {
      await store.moveModule(store.currentProject.id, moduleId, newIndex);
      console.log('Module déplacé');
    } catch (error) {
      console.error('Erreur lors du déplacement du module:', error);
    }
  };

  return {
    handleAddModule,
    handleUpdateModule,
    handleDeleteModule,
    handleMoveModule,
  };
};
