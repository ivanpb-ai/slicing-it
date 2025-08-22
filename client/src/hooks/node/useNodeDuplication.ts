
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { createDuplicatedNodes } from '@/utils/nodeManagement';
import { hasNetworkNode } from '@/utils/flowData/nodeCreation';

/**
 * Custom hook for node duplication operations
 */
export const useNodeDuplication = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  selectedElements: { nodes: Node[], edges: Edge[] }
) => {
  // Duplicate selected nodes
  const duplicateSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0) {
      toast.info('No nodes selected');
      return;
    }
    
    // Check if we're trying to duplicate a network node
    if (selectedElements.nodes.some((node) => node.data?.type === 'network') && hasNetworkNode(nodes)) {
      toast.error('Cannot duplicate Network node (only one allowed)');
      return;
    }
    
    try {
      // Create duplicated nodes
      const result = createDuplicatedNodes(
        selectedElements.nodes,
        nodes,
        edges
      );
      
      if (result) {
        const { newNodes, newEdges } = result;
        
        // Update state
        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);
        
        // Log success
        console.log(`Duplicated ${newNodes.length} nodes`);
        
        // Show toast
        toast.success(`Duplicated ${newNodes.length} nodes`);
      }
    } catch (error) {
      console.error('Error duplicating nodes:', error);
      toast.error('Failed to duplicate nodes');
    }
  }, [selectedElements, nodes, edges, setNodes, setEdges]);

  return {
    duplicateSelected
  };
};
