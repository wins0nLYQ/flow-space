import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSpaces, useCreateSpace } from '@/hooks/useSpaces';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { data: spaces, isLoading } = useSpaces();
  const createSpace = useCreateSpace();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSpace = async () => {
    setIsCreating(true);
    try {
      const newSpace = await createSpace.mutateAsync({
        name: 'My Space',
        description: 'Your first workspace',
      });
      // Navigate to the board view of the new space
      navigate({ to: `/spaces/${newSpace.id}/board` });
    } catch (error) {
      console.error('Failed to create space:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenSpace = (spaceId: string) => {
    navigate({ to: `/spaces/${spaceId}/board` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  // If no spaces exist, show onboarding
  if (!spaces || spaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">Welcome to FlowSpace</h2>
          <p className="text-gray-400 mb-8">
            Get started by creating your first space. A space is a workspace where you can organize your tasks and projects.
          </p>
          <button
            onClick={handleCreateSpace}
            disabled={isCreating}
            className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={20} />
                Create Your First Space
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Show list of spaces
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Spaces</h2>
          <p className="text-gray-400 text-sm mt-1">Select a space to get started</p>
        </div>
        <button
          onClick={handleCreateSpace}
          disabled={isCreating}
          className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus size={18} />
          New Space
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <button
            key={space.id}
            onClick={() => handleOpenSpace(space.id)}
            className="p-6 bg-[#1f1f1f] rounded-lg hover:bg-[#252525] transition-colors text-left group"
          >
            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
              {space.name}
            </h3>
            {space.description && (
              <p className="text-sm text-gray-400">{space.description}</p>
            )}
            <div className="mt-4 text-xs text-gray-500">
              Created {new Date(space.created_at).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
