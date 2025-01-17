export const assessmentFormats = {
  knowledge: [
    { value: 'multiple_choice', label: 'Multiple Choice', description: 'Test recall with options' },
    { value: 'true_false', label: 'True/False', description: 'Binary choice questions' },
    { value: 'matching', label: 'Matching', description: 'Connect related items' },
    { value: 'short_answer', label: 'Short Answer', description: 'Brief written responses' },
  ],
  skills: [
    { value: 'case_study', label: 'Case Study', description: 'Analyze real scenarios' },
    { value: 'practical', label: 'Practical Exercise', description: 'Hands-on application' },
    { value: 'simulation', label: 'Digital Simulation', description: 'Virtual practice environment' },
    { value: 'simple_project', label: 'Simple Project', description: 'Basic implementation task' },
  ],
  abilities: [
    { value: 'complex_project', label: 'Complex Project', description: 'Multi-phase implementation' },
    { value: 'problem_solving', label: 'Advanced Problem-Solving', description: 'Complex challenges' },
    { value: 'presentation', label: 'Oral Presentation', description: 'Verbal demonstration' },
    { value: 'collaborative', label: 'Collaborative Assessment', description: 'Group-based evaluation' },
  ],
} as const;

export const assessmentLevels = {
  1: { label: 'Unsatisfactory', description: 'Essential criteria not met' },
  2: { label: 'Satisfactory', description: 'Minimum requirements met' },
  3: { label: 'Very Satisfactory', description: 'Exceeds minimum expectations' },
  4: { label: 'Excellent', description: 'Exemplary mastery of all criteria' },
} as const;

export const knowledgeTypes = {
  knowledge: {
    levels: ['remembering', 'understanding'],
    label: 'Knowledge',
    description: 'Knowledge and comprehension',
    formats: assessmentFormats.knowledge,
    allowsPerformanceThreshold: false,
  },
  skills: {
    levels: ['applying', 'analyzing'],
    label: 'Skills',
    description: 'Application and analysis',
    formats: assessmentFormats.skills,
    allowsPerformanceThreshold: true,
  },
  abilities: {
    levels: ['evaluating', 'creating'],
    label: 'Competency',
    description: 'Evaluation and creation',
    formats: assessmentFormats.abilities,
    allowsPerformanceThreshold: true,
  },
} as const;

// Rest of the templates array remains the same
export const templates = [/* ... */];