
import { useNodesEdgesState } from './node/useNodesEdgesState';
import { useNodeSelectionManager } from './node/useNodeSelectionManager';
import { useNodeDeletion } from './node/useNodeDeletion';
import { useNodeDuplication } from './node/useNodeDuplication';
import { useCanvasOperationsManager } from './node/useCanvasOperationsManager';

export const useNodeEditorManager = () => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addEdgeWithHandles,
    reactFlowInstance
  } = useNodesEdgesState();

  const { selectedElements, onSelectionChange } = useNodeSelectionManager();

  const { deleteSelected } = useNodeDeletion(
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedElements
  );

  const { duplicateSelected } = useNodeDuplication(
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedElements
  );

  const { clearCanvas, initializeCanvas } = useCanvasOperationsManager(
    nodes,
    setNodes,
    setEdges
  );

  return {
    // Flow state
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addEdgeWithHandles,
    // Selection
    onSelectionChange,
    selectedElements,
    // Node operations
    deleteSelected,
    duplicateSelected,
    // Canvas operations
    clearCanvas,
    initializeCanvas,
    // Flow instance
    reactFlowInstance
  };
};
