import { Brain, Book, Wrench, Search, Scale, Lightbulb } from 'lucide-react';

export const taxonomyConfig = {
  remembering: {
    icon: Brain,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    darkIcon: 'text-blue-300',
    level: 1,
    label: 'Remembering',
    description: 'Recall facts and basic concepts'
  },
  understanding: {
    icon: Book,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    darkIcon: 'text-green-300',
    level: 2,
    label: 'Understanding',
    description: 'Explain ideas or concepts'
  },
  applying: {
    icon: Wrench,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    darkIcon: 'text-amber-300',
    level: 3,
    label: 'Applying',
    description: 'Use information in new situations'
  },
  analyzing: {
    icon: Search,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    darkIcon: 'text-orange-300',
    level: 4,
    label: 'Analyzing',
    description: 'Draw connections among ideas'
  },
  evaluating: {
    icon: Scale,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    darkIcon: 'text-red-300',
    level: 5,
    label: 'Evaluating',
    description: 'Justify a stand or decision'
  },
  creating: {
    icon: Lightbulb,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    darkIcon: 'text-purple-300',
    level: 6,
    label: 'Creating',
    description: 'Produce new or original work'
  },
};
