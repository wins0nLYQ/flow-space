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
      {/* View content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
