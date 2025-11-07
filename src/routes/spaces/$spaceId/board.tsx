import { createFileRoute } from '@tanstack/react-router';
import { useListsBySpace } from '@/hooks/useLists';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TemplateSelector } from '@/components/TemplateSelector';
import { useState } from 'react';

export const Route = createFileRoute('/spaces/$spaceId/board')({
  component: BoardView,
});

function BoardView() {
  const { spaceId } = Route.useParams();
  const { data: lists, isLoading } = useListsBySpace(spaceId);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Check if this is first-time setup (no lists exist)
  const needsSetup = !isLoading && (!lists || lists.length === 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading board...</div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <TemplateSelector
        spaceId={spaceId}
        onComplete={() => setShowTemplateSelector(false)}
      />
    );
  }

  return <KanbanBoard spaceId={spaceId} lists={lists || []} />;
}
