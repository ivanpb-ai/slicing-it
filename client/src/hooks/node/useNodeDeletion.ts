
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { filterDeletedNodes, filterDeletedEdges, removeEdgesForDeletedNodes } from '@/utils/nodeManagement';

/**
 * Custom hook for node deletion operations
 */
export const useNodeDeletion = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  selectedElements: { nodes: Node[], edges: Edge[] }
) => {
  // Delete selected nodes and edges
  const deleteSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
      toast.info('No elements selected');
      return;
    }
    
    // Get the IDs of selected nodes
    const selectedNodeIds = selectedElements.nodes.map((node) => node.id);
    
    // Filter out deleted nodes
    const newNodes = filterDeletedNodes(nodes, selectedElements.nodes);
    
    // Get the IDs of selected edges
    const selectedEdgeIds = selectedElements.edges.map((edge) => edge.id);
    
    // Filter out deleted edges and edges connected to deleted nodes
    const newEdges = filterDeletedEdges(
      removeEdgesForDeletedNodes(edges, selectedNodeIds),
      selectedElements.edges
    );
    
    // Update state
    setNodes(newNodes);
    setEdges(newEdges);
    
    // Log success
    console.log(`Deleted ${selectedElements.nodes.length} nodes and ${selectedElements.edges.length} edges`);
    
    // Show toast
    toast.success(`Deleted ${selectedElements.nodes.length} nodes and ${selectedElements.edges.length} edges`);
  }, [selectedElements, nodes, edges, setNodes, setEdges]);

  return {
    deleteSelected
  };
};
