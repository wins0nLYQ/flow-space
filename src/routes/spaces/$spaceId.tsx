import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useSpace } from '@/hooks/useSpaces';

export const Route = createFileRoute('/spaces/$spaceId')({
  component: SpaceLayout,
});

function SpaceLayout() {
  const { spaceId } = Route.useParams();
  const { data: space, isLoading } = useSpace(spaceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading space...</div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Space not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Space header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{space.name}</h2>
        {space.description && (
          <p className="text-gray-400 text-sm mt-1">{space.description}</p>
        )}
      </div>

      {/* View content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
