import { useState } from 'react';
import { X, Plus, GripVertical } from 'lucide-react';
import { useUpdateList } from '@/hooks/useLists';

interface ColumnEditorProps {
  listId: string;
  columns: string[];
  onClose: () => void;
}

export function ColumnEditor({ listId, columns, onClose }: ColumnEditorProps) {
  const [editedColumns, setEditedColumns] = useState<string[]>([...columns]);
  const updateList = useUpdateList();

  const handleAddColumn = () => {
    setEditedColumns([...editedColumns, 'New Column']);
  };

  const handleRemoveColumn = (index: number) => {
    if (editedColumns.length <= 1) {
      alert('You must have at least one column');
      return;
    }
    const newColumns = editedColumns.filter((_, i) => i !== index);
    setEditedColumns(newColumns);
  };

  const handleRenameColumn = (index: number, newName: string) => {
    const newColumns = [...editedColumns];
    newColumns[index] = newName;
    setEditedColumns(newColumns);
  };

  const handleSave = async () => {
    try {
      await updateList.mutateAsync({
        id: listId,
        status_columns: editedColumns,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update columns:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Columns</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {editedColumns.map((column, index) => (
            <div key={index} className="flex items-center gap-2">
              <button className="cursor-grab p-1 hover:bg-primary rounded">
                <GripVertical size={16} className="text-gray-500" />
              </button>
              <input
                type="text"
                value={column}
                onChange={(e) => handleRenameColumn(index, e.target.value)}
                className="flex-1 bg-primary px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                onClick={() => handleRemoveColumn(index)}
                className="p-1 hover:bg-primary rounded transition-colors text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddColumn}
          className="w-full mb-4 py-2 px-4 bg-primary hover:bg-[#1f1f1f] rounded text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Column
        </button>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-primary hover:bg-[#1f1f1f] rounded text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateList.isPending}
            className="flex-1 py-2 px-4 bg-white text-black hover:bg-gray-200 rounded text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateList.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
