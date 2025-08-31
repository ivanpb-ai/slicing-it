
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
    console.log(`🔥 ARRANGE BUTTON CLICKED: ${nodes.length} nodes to arrange`);
    console.log('🔥 Nodes:', nodes.map(n => ({ id: n.id, type: n.data?.type, pos: n.position })));
    
    if (nodes.length === 0) {
      console.log('🔥 NO NODES - stopping');
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
      console.log('🔥 CALLING arrangeNodesInLayout()...');
      // Call the arrange function
      arrangeNodesInLayout();
      console.log('🔥 arrangeNodesInLayout() RETURNED');
      
      // Check arrangement success immediately without delay for better performance
      if (reactFlowInstance) {
        const visibleNodes = reactFlowInstance.getNodes();
        
        console.log(`After arrangement: Found ${visibleNodes.length} visible nodes, expected ${nodes.length}`);
        
        // Check if arrangement was successful
        if (visibleNodes.length === 0 && nodesBackup.length > 0) {
          console.error('Nodes disappeared after arrangement, restoring from backup');
          toast.error('Layout issue detected: Restoring nodes');
          
          // Restore from backup
          setNodes(nodesBackup);
          setEdges(edgesBackup);
        } else {
          toast.success(`Successfully arranged ${visibleNodes.length} nodes in balanced hierarchical tree layout`);
        }
      }
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
