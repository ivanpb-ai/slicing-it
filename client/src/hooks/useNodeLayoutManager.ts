
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutType } from '../utils/flowData/layoutAlgorithms';

export const useNodeLayoutManager = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
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

    // Balanced tree layout options - create hierarchical, symmetrical layouts
    const layoutOptions = {
      type: 'balanced-tree' as LayoutType, 
      spacing: 250,
      nodeWidth: 180,
      nodeHeight: 120,
      horizontalSpacing: 250,
      verticalSpacing: 180,
      marginX: 400,
      marginY: 100,
      preventOverlap: true,
      edgeShortenFactor: 0.95
    };

    try {
      console.log('Arranging nodes in balanced tree layout');
      
      // Create a shallow copy of nodes to avoid mutation issues
      const nodesCopy = nodes.map(node => ({...node, position: {...node.position}}));
      
      // Use the grid rows layout
      const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
      
      if (arrangedNodes?.length > 0) {
        setNodes(arrangedNodes);
        toast.success('Nodes arranged in balanced hierarchical tree');
        
        // Delay event dispatch to ensure rendering completes
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('node-added'));
          window.dispatchEvent(new CustomEvent('layout-changed'));
        }, 100);
      }
    } catch (error) {
      console.error('Layout error:', error);
      
      // Emergency fallback - simple grid
      try {
        const fallbackNodes = arrangeNodes(nodes, edges, {
          type: 'grid' as LayoutType,
          spacing: 200,
          preventOverlap: true
        });
        setNodes(fallbackNodes);
        toast.warning('Using fallback grid layout due to arrangement issue');
      } catch (e) {
        console.error('Failed to apply fallback layout');
        toast.error('Failed to arrange nodes');
      }
    }
  }, [nodes, edges, setNodes]);

  return { arrangeNodesInLayout };
};
