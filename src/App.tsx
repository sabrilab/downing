import React, { useEffect } from 'react';
import SyllabusBuilder from './components/SyllabusBuilder';

function App() {
  useEffect(() => {
    // Réinitialiser le localStorage au démarrage
    localStorage.clear();
  }, []);

  return <SyllabusBuilder />;
}

export default App;