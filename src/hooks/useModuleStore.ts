import { useState, useEffect } from 'react';
import useStore from '../store';

// Store simple pour les modules
export const useModuleStore = () => {
  const currentProject = useStore(state => state.currentProject);
  const [modules, setModules] = useState(currentProject?.modules || []);

  useEffect(() => {
    // Mettre à jour les modules quand le projet change
    setModules(currentProject?.modules || []);

    // Écouter les mises à jour des modules
    const handleModuleUpdate = (event: CustomEvent) => {
      console.log('ModuleStore - Module mis à jour:', event.detail);
      setModules(event.detail.modules);
    };

    window.addEventListener('MODULE_UPDATED', handleModuleUpdate as EventListener);

    return () => {
      window.removeEventListener('MODULE_UPDATED', handleModuleUpdate as EventListener);
    };
  }, [currentProject]);

  return { modules };
};
