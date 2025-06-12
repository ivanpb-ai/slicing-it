
import { useCallback } from 'react';
import { toast } from 'sonner';

interface NodeSelectionActionsProps {
  selectedElements: {
    nodes: any[];
    edges: any[];
  };
  deleteSelected: () => void;
  duplicateSelected: () => void;
}

const NodeSelectionActions = ({ 
  selectedElements, 
  deleteSelected, 
  duplicateSelected 
}: NodeSelectionActionsProps) => {
  // Handle deletion of selected nodes/edges
  const handleDeleteSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
      return;
    }
    
    deleteSelected();
    toast.success('Selected elements deleted');
  }, [selectedElements, deleteSelected]);

  // Handle duplication of selected nodes
  const handleDuplicateSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0) return;
    
    duplicateSelected();
    toast.success('Selected nodes duplicated');
  }, [selectedElements.nodes, duplicateSelected]);

  return {
    handleDeleteSelected,
    handleDuplicateSelected
  };
};

export default NodeSelectionActions;
