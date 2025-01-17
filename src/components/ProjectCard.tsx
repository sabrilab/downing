import React from 'react';
import { Book } from 'lucide-react';
import { Project } from '../types';

interface Props {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: Props) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      style={{ borderLeftColor: project.color, borderLeftWidth: '4px' }}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h3>
        <div className="flex items-center text-gray-600">
          <Book size={16} className="mr-2" />
          <span>{project.objectives.length} objectives</span>
        </div>
      </div>
    </div>
  );
}