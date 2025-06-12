
import { useCallback } from 'react';
import { Node, Edge, XYPosition } from '@xyflow/react';
import { NodeType } from '@/types/nodeTypes';
import { useNodeOperations } from './useNodeOperations';
import { useNodeCreationOperations } from './node/useNodeCreationOperations';
import { useNodeState } from './useNodeState';
import { useNodesEdgesState } from './node/useNodesEdgesState';

export const useNodeCreation = (
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Get the current nodes and edges from useNodeState
  const { nodes, edges } = useNodeState();
  
  // Get the addEdgeWithHandles function from useNodesEdgesState
  const { addEdgeWithHandles } = useNodesEdgesState();
  
  // Use the refactored useNodeOperations hook with current nodes, edges, setters, and addEdgeWithHandles
  const { addNode: addNodeCore, createChildNode: createChildNodeCore } = 
    useNodeOperations(nodes, edges, setNodes, setEdges, addEdgeWithHandles);
    
  // Use our new hook for creation operations with error handling
  const { handleAddNode, handleCreateChildNode } = 
    useNodeCreationOperations(addNodeCore, createChildNodeCore);

  return {
    addNode: handleAddNode,
    createChildNode: handleCreateChildNode
  };
};
