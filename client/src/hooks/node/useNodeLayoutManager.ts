
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

    // Layout options using balanced tree layout for optimal hierarchical arrangement
    const layoutOptions = {
      type: 'balanced-tree' as LayoutType,
      horizontalSpacing: 250,     // Optimal spacing for balanced tree
      verticalSpacing: 180,       // Optimal vertical spacing
      nodeWidth: 180,
      nodeHeight: 120,
      marginX: 400,               // Optimized margin for balanced tree
      marginY: 100,               // Optimized margin for balanced tree
      preventOverlap: true,
      edgeShortenFactor: 0.95,    // Optimal edge factor for balanced tree
      minNodeDistance: 10
    };

    try {
      console.log('✅ BALANCED TREE: Starting layout arrangement with improved spacing');
      console.log('Layout options:', layoutOptions);
      
      const nodesCopy = nodes.map(node => ({...node}));
      const arrangedNodes = arrangeNodes(nodesCopy, edges, layoutOptions);
      
      console.log('✅ Received arranged nodes:', arrangedNodes?.length, 'nodes');
      console.log('Sample positions:', arrangedNodes?.slice(0, 3).map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));
      
      if (arrangedNodes?.length > 0) {
        // Set flag to prevent automatic fitView calls that would override our layout
        window.sessionStorage.setItem('prevent-fitview', 'true');
        
        console.log('🎯 SETTING NODES WITH CALCULATED POSITIONS:');
        arrangedNodes.slice(0, 5).forEach(node => {
          console.log(`  ${node.id}: x=${node.position.x}, y=${node.position.y}`);
        });
        
        setNodes(arrangedNodes);
        toast.success('Nodes arranged in balanced hierarchical tree layout');
        
        // Check positions after a short delay to see if they're being overridden
        setTimeout(() => {
          console.log('🔍 CHECKING POSITIONS AFTER 100ms:');
          const currentNodes = document.querySelectorAll('[data-id]');
          Array.from(currentNodes).slice(0, 5).forEach(el => {
            const rect = el.getBoundingClientRect();
            const id = el.getAttribute('data-id');
            console.log(`  ${id}: DOM x=${rect.left}, y=${rect.top}`);
          });
        }, 100);
        
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
  }, [nodes, edges, setNodes, getZoom]);

  return { arrangeNodesInLayout };
};
