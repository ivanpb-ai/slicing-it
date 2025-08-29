
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutType } from '../../utils/flowData/layouts';

export const useNodeLayoutManager = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  const reactFlowInstance = useReactFlow();

  const arrangeNodesInLayout = useCallback(() => {
    if (nodes.length === 0) {
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
      horizontalSpacing: 800,     // Increased to prevent overlap of DNN/5QI nodes
      verticalSpacing: 650,       // Further increased for better vertical spacing between all levels
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 100,
      marginY: 100,
      preventOverlap: true,
      edgeShortenFactor: 0.7,     // Shortened edges for more compact connections
      minNodeDistance: 50         
    };

    try {
      console.log('✅ BALANCED TREE: Starting layout arrangement with improved spacing');
      console.log('Layout options:', layoutOptions);
      
      const nodesCopy = nodes.map(node => ({...node}));
      const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
      
      console.log('✅ Balanced tree layout completed:', arrangedNodes?.length, 'nodes positioned in hierarchy');
      
      if (arrangedNodes?.length > 0) {
        // Set flag to prevent automatic fitView calls that would override our layout
        window.sessionStorage.setItem('prevent-fitview', 'true');
        
        console.log('🎯 SETTING NODES WITH CALCULATED POSITIONS:');
        arrangedNodes.slice(0, 5).forEach(node => {
          console.log(`  ${node.id}: x=${node.position.x}, y=${node.position.y}`);
        });
        
        setNodes(arrangedNodes);
        toast.success('Nodes arranged in balanced hierarchical tree layout');
        
        // Force viewport to show all positioned nodes with proper zoom
        setTimeout(() => {
          console.log('✅ Layout applied - fitting view to show proper spacing');
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ 
              padding: 100,
              maxZoom: 0.8,     // Prevent zooming too close
              minZoom: 0.2,     // Allow zooming out to see full layout
              duration: 500     // Smooth transition
            });
          }
        }, 200);
        
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('node-added'));
          window.dispatchEvent(new CustomEvent('layout-changed'));
          window.dispatchEvent(new CustomEvent('force-cell-visibility'));
          
          // Clear the flag after events are processed
          setTimeout(() => {
            window.sessionStorage.removeItem('prevent-fitview');
          }, 1000);
        });
      }
    } catch (error) {
      console.error('Layout error:', error);
      
      try {
        const fallbackNodes = arrangeNodes(nodes, edges, {
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
        setNodes(fallbackNodes);
        toast.warning('Using fallback grid layout');
      } catch (e) {
        console.error('Failed to apply fallback layout');
        toast.error('Failed to arrange nodes');
      }
    }
  }, [nodes, edges, setNodes, reactFlowInstance]);

  return { arrangeNodesInLayout };
};
