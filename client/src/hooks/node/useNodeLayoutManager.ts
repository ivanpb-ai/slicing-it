
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutType } from '../../utils/flowData/layouts';
import { arrangeNodesInBalancedTree } from '../../utils/flowData/layouts/balancedTreeLayout';

export const useNodeLayoutManager = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>,
) => {
  const reactFlowInstance = useReactFlow();

  const arrangeNodesInLayout = useCallback(() => {
    // Get fresh nodes and edges from ReactFlow instance to avoid stale closure
    const currentNodes = reactFlowInstance?.getNodes() || nodes;
    const currentEdges = reactFlowInstance?.getEdges() || edges;
    
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

    // Layout options with proper spacing to prevent overlap
    const layoutOptions = {
      type: 'balanced-tree' as LayoutType,
      horizontalSpacing: 400,     // Reduced to fix DNN overlapping
      verticalSpacing: 180,       // Consistent with child positioning
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 100,
      marginY: 100,
      preventOverlap: true,
      edgeShortenFactor: 0.95,
      minNodeDistance: 50         
    };

    try {
      
      // AGGRESSIVE duplicate filtering - this prevents React key warnings
      const uniqueInputNodes = currentNodes.filter((node, index) => 
        currentNodes.findIndex(n => n.id === node.id) === index
      );
      
      if (currentNodes.length !== uniqueInputNodes.length) {
        console.log(`🧹 Pre-layout duplicate filtering: ${currentNodes.length} -> ${uniqueInputNodes.length} nodes`);
      }
      
      const nodesCopy = uniqueInputNodes.map(node => ({...node}));
      
      // Special handling for balanced-tree layout that returns cleaned edges
      if (layoutOptions.type === 'balanced-tree') {
        // Ensure edges is defined - use current edges from ReactFlow
        const safeEdges = currentEdges || [];
        console.log('🔧 Layout using current edges:', safeEdges.length);
        const balancedResult = arrangeNodesInBalancedTree(nodesCopy, safeEdges, layoutOptions);
        
        if (balancedResult.nodes?.length > 0) {
          // Ensure no duplicate nodes
          const uniqueNodes = balancedResult.nodes.filter((node, index, arr) => 
            arr.findIndex(n => n.id === node.id) === index
          );
          
          console.log(`🧹 Filtered duplicates: ${balancedResult.nodes.length} -> ${uniqueNodes.length} nodes`);
          
          // CRITICAL FIX: Force React re-render by creating completely new node objects
          const forceUpdatedNodes = uniqueNodes.map(node => ({
            ...node,
            position: { ...node.position }, // Force position object recreation
            data: { ...node.data } // Force data object recreation
          }));
          
          // CRITICAL FIX: Use ReactFlow instance to update nodes to maintain interactivity
          if (reactFlowInstance) {
            reactFlowInstance.setNodes(forceUpdatedNodes);
          } else {
            setNodes(forceUpdatedNodes);
          }
          
          // Update edges with cleaned edges (always apply cleaned edges)
          if (balancedResult.cleanedEdges) {
            // Ensure no duplicate edges
            const uniqueEdges = balancedResult.cleanedEdges.filter((edge, index, arr) => 
              arr.findIndex(e => e.id === edge.id) === index
            );
            
            console.log(`🧹 Updating edges: ${currentEdges.length} -> ${uniqueEdges.length} (filtered duplicates)`);
            // CRITICAL FIX: Always update ReactFlow instance AND React state to keep them in sync
            if (reactFlowInstance) {
              reactFlowInstance.setEdges(uniqueEdges);
            }
            if (setEdges) {
              setEdges(uniqueEdges);
            }
            
            // Sanity check to confirm persistence
            setTimeout(() => {
              console.log('🔍 Post-update edges count:', reactFlowInstance?.getEdges()?.length || 0);
            }, 10);
          }
          
          // Event dispatch removed - was causing unresponsiveness
          
          return uniqueNodes;
        }
      } else {
        // Use normal arrangement for other layout types
        const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
        if (arrangedNodes?.length > 0) {
          // Ensure no duplicate nodes for non-balanced layouts too
          const uniqueNodes = arrangedNodes.filter((node, index, arr) => 
            arr.findIndex(n => n.id === node.id) === index
          );
          
          console.log(`🧹 Regular layout - filtered duplicates: ${arrangedNodes.length} -> ${uniqueNodes.length} nodes`);
          // CRITICAL FIX: Use ReactFlow instance for regular layouts too
          if (reactFlowInstance) {
            reactFlowInstance.setNodes(uniqueNodes);
          } else {
            setNodes(uniqueNodes);
          }
          return uniqueNodes;
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
        // CRITICAL FIX: Use ReactFlow instance for fallback too
        if (reactFlowInstance) {
          reactFlowInstance.setNodes(fallbackNodes);
        } else {
          setNodes(fallbackNodes);
        }
        toast.warning('Using fallback grid layout');
      } catch (e) {
        console.error('Failed to apply fallback layout');
        toast.error('Failed to arrange nodes');
      }
    }
  }, [edges, setNodes, setEdges]); // FIXED: Removed nodes to prevent infinite callback recreation

  return { arrangeNodesInLayout };
};
