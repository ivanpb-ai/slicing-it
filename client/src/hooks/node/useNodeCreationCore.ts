
import { useCallback } from 'react';
import { Node, XYPosition } from '@xyflow/react';
import { NodeType } from '../../types/nodeTypes';
import { createNode } from '../../utils/flowData/nodeCreation';

/**
 * Ultra-simplified hook for creating nodes - minimal operations
 */
export const useNodeCreationCore = (
  nodes: Node[],
  edges: any[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) => {
  // Add a new node with minimal processing
  const addNodeCore = useCallback(
    (
      type: NodeType, 
      position: XYPosition,
      fiveQIId?: string
    ) => {
      try {
        // Create the node with minimal properties
        const newNode = createNode(type, position, undefined, fiveQIId);
        
        // Enhanced style to ensure visibility - special handling for network nodes
        if (type === 'network') {
          newNode.style = {
            ...newNode.style,
            visibility: "visible",
            opacity: 1,
            display: "flex",
            zIndex: 2000,
            background: '#f5f7ff',
            borderWidth: '2px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)'
          };
          
          // Add special data attributes for network nodes
          newNode.data = {
            ...newNode.data,
            ensureVisible: true,
            forceVisible: true,
            visibilityEnforced: true,
            preventHiding: true
          };
          
          console.log(`Created network node with enhanced visibility: ${newNode.id}`);
        } else {
          // Standard visibility enhancement for other nodes
          newNode.style = {
            ...newNode.style,
            visibility: "visible",
            opacity: 1,
            display: "flex",
            zIndex: type === 'cell-area' ? 1800 : 1000
          };
        }
        
        // Add the node to state - ReactFlow will automatically sync
        setNodes(prevNodes => [...prevNodes, newNode]);
        console.log(`Added new ${type} node with ID: ${newNode.id}`);
        
        // Trigger visibility events
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('node-added'));
          window.dispatchEvent(new CustomEvent('node-visibility-check'));
          window.dispatchEvent(new CustomEvent('ensure-nodes-visible'));
          
          // Force visibility at the DOM level - especially important for network nodes
          const nodeElement = document.querySelector(`[data-id="${newNode.id}"]`);
          if (nodeElement) {
            const style = (nodeElement as HTMLElement).style;
            style.setProperty('visibility', 'visible', 'important');
            style.setProperty('display', 'flex', 'important');
            style.setProperty('opacity', '1', 'important');
            
            if (type === 'network') {
              style.setProperty('z-index', '2000', 'important');
              style.setProperty('background', '#f5f7ff', 'important');
              style.setProperty('border-width', '2px', 'important');
            }
          }
        }, 50);
        
        return newNode;
      } catch (error) {
        console.error(`Error creating node of type ${type}:`, error);
        return null;
      }
    },
    [setNodes]
  );

  return { addNodeCore };
};
