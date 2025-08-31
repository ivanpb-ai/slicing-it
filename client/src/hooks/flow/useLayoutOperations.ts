
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';

/**
 * Custom hook to handle layout operations for the flow with improved
 * balance and error handling
 */
export const useLayoutOperations = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  arrangeNodesInLayout: () => void
) => {
  // Get ReactFlow instance for viewport operations
  const reactFlowInstance = useReactFlow();
  
  // Handle arranging layout with improved error handling
  const handleArrangeLayout = useCallback(() => {
    console.log(`useLayoutOperations: Arranging layout for ${nodes.length} nodes`);
    
    if (nodes.length === 0) {
      toast.info('No nodes to arrange', {
        duration: 2000,
        position: 'top-center'
      });
      return;
    }
    
    // Show a toast to indicate the operation is starting
    toast.info('Arranging nodes in balanced hierarchical tree layout...', {
      duration: 2000,
      position: 'top-center'
    });
    
    // Make a backup of the current nodes and edges
    const nodesBackup = nodes.map(node => ({...node, position: {...node.position}}));
    const edgesBackup = [...edges];
    
    try {
      // Call the arrange function
      arrangeNodesInLayout();
      
      // CRITICAL FIX: Reset ReactFlow viewport after arrangement to prevent unresponsiveness
      setTimeout(() => {
        if (reactFlowInstance) {
          const allNodes = reactFlowInstance.getNodes();
          if (allNodes.length > 0) {
            // Fit view to show all arranged nodes
            reactFlowInstance.fitView({ 
              padding: 0.1,
              duration: 800
            });
          }
        }
      }, 100);
      
      // Arrangement completed successfully
      toast.success(`Successfully arranged nodes in balanced hierarchical tree layout`);
    } catch (error) {
      console.error('Error in layout arrangement:', error);
      toast.error('Failed to arrange layout: Restoring previous arrangement');
      
      // Restore from backup
      setNodes(nodesBackup);
      setEdges(edgesBackup);
    }
  }, [arrangeNodesInLayout, nodes, edges, reactFlowInstance, setNodes, setEdges]);

  return {
    handleArrangeLayout
  };
};
