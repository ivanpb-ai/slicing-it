
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutType } from '../../utils/flowData/layouts';
import { arrangeNodesInBalancedTree } from '../../utils/flowData/layouts/balancedTreeLayout';

export const useNodeLayoutManager = (
  nodes?: Node[],
  edges?: Edge[],
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>,
) => {
  const reactFlowInstance = useReactFlow();

  const arrangeNodesInLayout = useCallback(() => {
    // Get fresh nodes and edges from ReactFlow instance to avoid stale closure
    const currentNodes = reactFlowInstance?.getNodes() || nodes || [];
    const currentEdges = reactFlowInstance?.getEdges() || edges || [];
    
    // Use provided state setters or fall back to ReactFlow instance methods
    const updateNodes = setNodes || ((newNodes: Node[]) => {
      if (reactFlowInstance) {
        console.log('📍 Layout Manager: Using ReactFlow instance setNodes fallback');
        reactFlowInstance.setNodes(newNodes);
      } else {
        console.warn('📍 Layout Manager: No setNodes method available');
      }
    });
    
    const updateEdges = setEdges || ((newEdges: Edge[]) => {
      if (reactFlowInstance) {
        console.log('📍 Layout Manager: Using ReactFlow instance setEdges fallback');
        reactFlowInstance.setEdges(newEdges);
      } else {
        console.warn('📍 Layout Manager: No setEdges method available');
      }
    });
    
    if (currentNodes.length === 0) {
      toast.info('No nodes to arrange');
      return;
    }

    // Prevent layout recalculation during active drawing
    const isEdgeBeingCreated = document.querySelector('.react-flow__connection-path');
    if (isEdgeBeingCreated) {
      console.log('Avoiding layout arrangement during active edge creation');
      return;
    }

    // Layout options with massive spacing to accommodate very tall RRP nodes with band data
    const layoutOptions = {
      type: 'balanced-tree' as LayoutType,
      horizontalSpacing: 400,     // Horizontal spacing between siblings
      verticalSpacing: 450,       // MASSIVE INCREASE: Accommodate RRP nodes up to 300px+ tall (was 320)
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 100,
      marginY: 250,              // MASSIVE INCREASE: Much more top margin for very large RRP nodes (was 200)
      preventOverlap: true,
      edgeShortenFactor: 0.95,
      minNodeDistance: 50         
    };

    try {
      // Create copy of nodes for layout processing
      const nodesCopy = currentNodes.map(node => ({...node}));
      
      // Special handling for balanced-tree layout that returns cleaned edges
      if (layoutOptions.type === 'balanced-tree') {
        // Ensure edges is defined - use current edges from ReactFlow
        const safeEdges = currentEdges || [];
        console.log('🔧 Layout using current edges:', safeEdges.length);
        const balancedResult = arrangeNodesInBalancedTree(nodesCopy, safeEdges, layoutOptions);
        
        if (balancedResult.nodes?.length > 0) {
          // Use state setter (provided or fallback) to update nodes
          updateNodes(balancedResult.nodes);
          
          // Update edges if provided by layout algorithm
          if (balancedResult.cleanedEdges) {
            updateEdges(balancedResult.cleanedEdges);
          }
          
          // Event dispatch removed - was causing unresponsiveness
          
          return balancedResult.nodes;
        }
      } else {
        // Use normal arrangement for other layout types
        const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
        if (arrangedNodes?.length > 0) {
          // Use state setter (provided or fallback) to update nodes
          updateNodes(arrangedNodes);
          return arrangedNodes;
        }
      }
      
      // If we reach here, no layout was applied
      console.warn('No layout was applied - this should not happen');
      toast.warning('Layout arrangement did not complete');
    } catch (error) {
      console.error('Layout error:', error);
      
      try {
        const fallbackNodes = arrangeNodes(currentNodes, edges, {
          type: 'grid' as LayoutType,
          spacing: 250,              // Proper fallback spacing
          preventOverlap: true,
          verticalSpacing: 200,      // Proper vertical spacing instead of 1px!
          horizontalSpacing: 300,    // Proper horizontal spacing
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 400,
          marginY: 100
        });
        // Use state setter (provided or fallback) for fallback layout
        updateNodes(fallbackNodes);
        toast.warning('Using fallback grid layout');
      } catch (e) {
        console.error('Failed to apply fallback layout');
        toast.error('Failed to arrange nodes');
      }
    }
  }, [edges, setNodes, setEdges]); // FIXED: Removed nodes to prevent infinite callback recreation

  return { arrangeNodesInLayout };
};
