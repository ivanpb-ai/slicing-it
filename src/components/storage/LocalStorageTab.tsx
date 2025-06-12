
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SavedGraph } from '@/hooks/types';
import GraphNameInput from './GraphNameInput';

type LocalStorageTabProps = {
  mode: 'save' | 'load';
  graphName: string;
  setGraphName: (name: string) => void;
  savedGraphs: SavedGraph[];
  onSave: () => boolean;
  onLoad: (graph: SavedGraph) => void;
  onDelete: (name: string, event: React.MouseEvent) => void;
  onClose: () => void;
};

const LocalStorageTab: React.FC<LocalStorageTabProps> = ({
  mode,
  graphName,
  setGraphName,
  savedGraphs,
  onSave,
  onLoad,
  onDelete,
  onClose,
}) => {
  const handleSaveGraph = () => {
    if (!graphName.trim()) {
      toast.error('Please enter a graph name');
      return;
    }
    
    try {
      const result = onSave();
      if (result) {
        setGraphName('');
        onClose();
      }
    } catch (error) {
      console.error('Error saving graph:', error);
      toast.error('Failed to save graph');
    }
  };

  return (
    <div className="space-y-4">
      {mode === 'save' ? (
        <div className="space-y-2">
          <GraphNameInput 
            graphName={graphName} 
            onChange={setGraphName} 
          />
          <Button onClick={handleSaveGraph} className="w-full">
            Save Graph
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Saved Graphs</Label>
          {savedGraphs.length > 0 ? (
            <SavedGraphsList 
              savedGraphs={savedGraphs} 
              onLoad={onLoad} 
              onDelete={onDelete} 
            />
          ) : (
            <div className="text-center py-4 text-gray-500">
              No saved graphs found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Extracted SavedGraphsList component
type SavedGraphsListProps = {
  savedGraphs: SavedGraph[];
  onLoad: (graph: SavedGraph) => void;
  onDelete: (name: string, event: React.MouseEvent) => void;
};

const SavedGraphsList: React.FC<SavedGraphsListProps> = ({ 
  savedGraphs, 
  onLoad, 
  onDelete 
}) => {
  return (
    <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-2">
      {savedGraphs.map((graph) => (
        <div
          key={graph.id}
          className="flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-100"
          onClick={() => onLoad(graph)}
        >
          <div>
            <div className="font-medium">{graph.name}</div>
            <div className="text-xs text-gray-500">
              {new Date(graph.createdAt).toLocaleString()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onDelete(graph.name, e)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default LocalStorageTab;
