export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
  icon: string;
}

export const boardTemplates: BoardTemplate[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Perfect for software development and engineering teams',
    columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
    icon: 'Code',
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Ideal for research projects and academic work',
    columns: ['Ideas', 'Planning', 'In Progress', 'Analysis', 'Complete'],
    icon: 'FlaskConical',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Great for content creation and marketing campaigns',
    columns: ['Ideation', 'Draft', 'Review', 'Scheduled', 'Published'],
    icon: 'Megaphone',
  },
  {
    id: 'general',
    name: 'General',
    description: 'Simple workflow for any type of project',
    columns: ['To Do', 'In Progress', 'Done'],
    icon: 'LayoutGrid',
  },
];

export function getTemplate(id: string): BoardTemplate | undefined {
  return boardTemplates.find((template) => template.id === id);
}
