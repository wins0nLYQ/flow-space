import { useNavigate, useParams } from '@tanstack/react-router';
import { useSpaces } from '@/hooks/useSpaces';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Header() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const { data: spaces, isLoading } = useSpaces();

  const currentSpaceId = params.spaceId as string | undefined;
  const currentSpace = spaces?.find(s => s.id === currentSpaceId);

  const handleSpaceChange = (spaceId: string) => {
    navigate({ to: '/spaces/$spaceId/board', params: { spaceId } });
  };

  return (
    <header className="bg-primary">
      <div className="flex items-center">
        <Select
          value={currentSpaceId}
          onValueChange={handleSpaceChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px] text-md font-semibold border-none bg-secondary text-secondary-foreground hover:bg-secondary/50 focus:ring-0">
            <SelectValue placeholder="Select a space">
              {currentSpace?.name || 'FlowSpace'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {spaces?.map((space) => (
              <SelectItem key={space.id} value={space.id}>
                {space.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
