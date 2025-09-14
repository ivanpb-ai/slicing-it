
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
      console.log('🚀 Starting arrangeNodesInLayout...');
      // Call the arrange function
      arrangeNodesInLayout();
      console.log('✅ arrangeNodesInLayout completed successfully');
      
      // FIXED: Defer fitView until after nodes are measured using double RAF
      console.log('🔍 FitView: Deferring fitView until nodes are measured...');
      if (reactFlowInstance) {
        console.log('✅ FitView: ReactFlow instance available, scheduling deferred fitView');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (reactFlowInstance) {
              console.log('🎯 FitView: Executing deferred fitView after node measurement');
              reactFlowInstance.fitView({ 
                padding: 0.22,           // Increased padding for better overview
                duration: 350,           // Slightly faster animation
                includeHiddenNodes: false,
                minZoom: 0.15           // Prevent over-zoomed-out views
              });
              console.log('🎯 FitView: Deferred fitView completed successfully');
            }
          });
        });
      } else {
        console.error('❌ FitView: ReactFlow instance not available!');
      }
      
      // Arrangement completed successfully
      console.log('🎉 Showing success toast...');
      toast.success(`Successfully arranged nodes in balanced hierarchical tree layout`);
      console.log('✅ Success toast shown');
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
