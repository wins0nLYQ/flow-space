import { useState } from 'react';
import { boardTemplates, type BoardTemplate } from '@/lib/boardTemplates';
import { useCreateList } from '@/hooks/useLists';
import { Code, FlaskConical, Megaphone, LayoutGrid } from 'lucide-react';

interface TemplateSelectorProps {
  spaceId: string;
  onComplete: () => void;
}

const iconMap = {
  Code,
  FlaskConical,
  Megaphone,
  LayoutGrid,
};

export function TemplateSelector({ spaceId, onComplete }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const createList = useCreateList();

  const handleSelectTemplate = async (template: BoardTemplate) => {
    try {
      await createList.mutateAsync({
        name: 'Main Board',
        space_id: spaceId,
        status_columns: template.columns,
      });
      onComplete();
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Board Template</h2>
          <p className="text-gray-400">
            Select a template that matches your workflow. You can customize columns later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boardTemplates.map((template) => {
            const Icon = iconMap[template.icon as keyof typeof iconMap];
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                onDoubleClick={() => handleSelectTemplate(template)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-white bg-secondary'
                    : 'border-gray-700 hover:border-gray-600 bg-[#1f1f1f]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      isSelected ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.columns.map((column) => (
                        <span
                          key={column}
                          className="px-2 py-1 bg-primary rounded text-xs text-gray-300"
                        >
                          {column}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedTemplate && (
          <div className="mt-8 text-center">
            <button
              onClick={() => handleSelectTemplate(selectedTemplate)}
              disabled={createList.isPending}
              className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createList.isPending ? 'Creating Board...' : 'Create Board'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
