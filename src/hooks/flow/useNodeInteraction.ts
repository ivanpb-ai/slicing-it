
import { useCallback } from 'react';
import { NodeType } from '@/types/nodeTypes';
import { useChildNodeTypeResolver } from './interactions/useChildNodeTypeResolver';
import { useNodePositioning } from './interactions/useNodePositioning';

interface UseNodeInteractionProps {
  createChildNode: (type: NodeType, position: { x: number, y: number }, parentId: string, fiveQIId?: string) => void;
}

export const useNodeInteraction = ({ createChildNode }: UseNodeInteractionProps) => {
  const { resolveChildNodeType } = useChildNodeTypeResolver();
  const { calculateChildNodePosition } = useNodePositioning();
  
  // Handler for node double click - simplified and optimized
  const onNodeDoubleClick = useCallback(
    (event, node) => {
      console.log(`NodeEditor: Double clicked node ${node.id}`);
      
      // Extract type from node
      const nodeType = node.data?.type;
      
      // Determine which type of node to create based on parent type
      const childType = resolveChildNodeType(nodeType);
      
      if (childType) {
        // Calculate optimal position for the child node - directly below parent
        const position = calculateChildNodePosition(node, nodeType);
        
        // Create child node with minimal delay
        setTimeout(() => {
          createChildNode(childType as NodeType, position, node.id);
          
          // Use a simpler method to ensure visibility
          window.dispatchEvent(new CustomEvent('node-added'));
        }, 10);
      }
    },
    [createChildNode, resolveChildNodeType, calculateChildNodePosition]
  );

  // Handler for background click
  const onPaneClick = useCallback(() => {
    console.log('NodeEditor: Background click - clearing selection');
  }, []);

  return {
    onNodeDoubleClick,
    onPaneClick
  };
};
