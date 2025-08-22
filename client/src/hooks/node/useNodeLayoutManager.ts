
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { arrangeNodes, LayoutType } from '../../utils/flowData/layouts';

export const useNodeLayoutManager = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  const { getZoom } = useReactFlow();

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

    // Layout options using tree layout with PERFECT COMPACT spacing
    const layoutOptions = {
      type: 'tree' as LayoutType,
      horizontalSpacing: 100,     // PERFECT COMPACT: Reduced from 150 to 100
      verticalSpacing: 1,
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 150,               // PERFECT COMPACT: Reduced from 200 to 150
      marginY: 50,                // PERFECT COMPACT: Reduced from 80 to 50
      preventOverlap: true,
      edgeCrossingReduction: true,
      edgeShortenFactor: 0.98,    // PERFECT COMPACT: Increased to make edges even shorter
      minNodeDistance: 10,        // PERFECT COMPACT: Reduced from 20 to 10
      preservePositions: false,
      levelHeight: 1
    };

    try {
      console.log('Arranging nodes with PERFECT COMPACT tree layout');
      
      const nodesCopy = nodes.map(node => ({...node}));
      const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
      
      if (arrangedNodes?.length > 0) {
        setNodes(arrangedNodes);
        toast.success('Nodes arranged in perfect compact tree layout');
        
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('node-added'));
          window.dispatchEvent(new CustomEvent('layout-changed'));
          window.dispatchEvent(new CustomEvent('force-cell-visibility'));
        });
      }
    } catch (error) {
      console.error('Layout error:', error);
      
      try {
        const fallbackNodes = arrangeNodes(nodes, edges, {
          type: 'grid' as LayoutType,
          spacing: 100,              // PERFECT COMPACT: Reduced fallback spacing too
          preventOverlap: true,
          verticalSpacing: 1
        });
        setNodes(fallbackNodes);
        toast.warning('Using perfect compact fallback grid layout');
      } catch (e) {
        console.error('Failed to apply fallback layout');
        toast.error('Failed to arrange nodes');
      }
    }
  }, [nodes, edges, setNodes, getZoom]);

  return { arrangeNodesInLayout };
};
