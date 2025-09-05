
import { useCallback, useState, useRef } from 'react';
import { XYPosition, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { NodeType } from '../types/nodeTypes';
import { detectParentNodeFromDOM, detectParentNodeFromPosition } from './flow/useParentNodeDetection';
import { parseDragData } from './flow/useDragDataParser';
import { findNonOverlappingPosition, getNodeDimensions } from '../utils/flowData/positioning/nodeCollisionDetection';
import { useNodeRelationships } from './node/useNodeRelationships';

// Standard drag and drop handling for all node types with collision prevention and hierarchy enforcement
export const useNodeDragDrop = (
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  addNode: (type: NodeType, position: XYPosition, fiveQIId?: string) => void,
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => void
) => {
  const reactFlowInstance = useReactFlow();
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const isDraggingRef = useRef(false);
  
  // Use the node relationships hook for validation
  const { validateParentChildRelationship } = useNodeRelationships();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    
    if (!isDraggingRef.current) {
      isDraggingRef.current = true;
      console.log('useNodeDragDrop: Drag started');
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      
      isDraggingRef.current = false;
      console.log('useNodeDragDrop: Drop event triggered');
      
      if (isProcessingDrop) {
        console.log('useNodeDragDrop: Already processing a drop, ignoring');
        return;
      }
      
      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.error('useNodeDragDrop: ReactFlow wrapper or instance not available');
        return;
      }

      try {
        setIsProcessingDrop(true);
        
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const rawPosition = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        
        const dragDataString = event.dataTransfer.getData('text/plain');
        console.log(`useNodeDragDrop: Drop event received with data: "${dragDataString}" at position:`, rawPosition);
        
        if (!dragDataString) {
          console.error('useNodeDragDrop: No drag data found');
          setIsProcessingDrop(false);
          return;
        }
        
        const parsedData = parseDragData(dragDataString);
        if (!parsedData) {
          console.error('useNodeDragDrop: Failed to parse drag data');
          setIsProcessingDrop(false);
          return;
        }
        
        const { nodeType, fiveQIId } = parsedData;
        console.log(`useNodeDragDrop: Parsed drag data: nodeType="${nodeType}", fiveQIId="${fiveQIId}"`);
        
        // Get existing nodes for collision detection
        const existingNodes = reactFlowInstance.getNodes();
        const dimensions = getNodeDimensions(nodeType);
        
        // Find a safe position that doesn't overlap
        const safePosition = findNonOverlappingPosition(
          rawPosition,
          existingNodes,
          dimensions.width,
          dimensions.height
        );
        
        if (safePosition.x !== rawPosition.x || safePosition.y !== rawPosition.y) {
          console.log(`useNodeDragDrop: Adjusted position to prevent overlap:`, safePosition);
        }
        
        // Try to detect if we're dropping onto a parent node
        const elementsFromPoint = document.elementsFromPoint(event.clientX, event.clientY);
        console.log('useNodeDragDrop: Elements at drop point:', elementsFromPoint.length);
        
        let parentId = detectParentNodeFromDOM(elementsFromPoint, event.clientX, event.clientY);
        
        // If no parent found with DOM, try position-based detection
        if (!parentId) {
          parentId = detectParentNodeFromPosition(existingNodes, rawPosition);
        }
        
        console.log(`useNodeDragDrop: Detected parent: ${parentId || 'none'}`);
        
        // Create node with or without parent - with hierarchy validation
        if (parentId) {
          const parentNode = existingNodes.find(n => n.id === parentId);
          
          // Validate the parent-child relationship according to hierarchy rules
          if (!validateParentChildRelationship(parentNode, nodeType)) {
            console.log(`useNodeDragDrop: Invalid hierarchy - cannot place ${nodeType} under ${parentNode?.data?.type}`);
            setIsProcessingDrop(false);
            return; // Validation failed, don't create the node
          }
          
          console.log(`useNodeDragDrop: Creating child ${nodeType} node under parent ${parentId}`);
          
          if (parentNode) {
            console.log(`useNodeDragDrop: Parent node found: ${parentNode.data?.type}`);
            
            // Special positioning for 5QI nodes under DNN nodes
            if (nodeType === '5qi' && parentNode.data?.type === 'dnn') {
              const childPosition = findNonOverlappingPosition(
                {
                  x: parentNode.position.x,
                  y: parentNode.position.y + 120
                },
                existingNodes,
                dimensions.width,
                dimensions.height
              );
              console.log(`useNodeDragDrop: Positioning 5QI node below DNN at:`, childPosition);
              createChildNode(nodeType, childPosition, parentId, fiveQIId);
              toast.success(`Added 5QI ${fiveQIId || 'node'} as child of DNN node`);
            } else {
              // Position other child nodes with standard offset
              const childPosition = findNonOverlappingPosition(
                {
                  x: parentNode.position.x + 20,
                  y: parentNode.position.y + 100
                },
                existingNodes,
                dimensions.width,
                dimensions.height
              );
              console.log('useNodeDragDrop: Child position calculated:', childPosition);
              createChildNode(nodeType, childPosition, parentId, fiveQIId);
              toast.success(`Added ${nodeType} node as child of ${parentNode.data?.type || 'parent'} node`);
            }
          } else {
            console.log('useNodeDragDrop: Parent node not found in ReactFlow instance, creating at safe position');
            createChildNode(nodeType, safePosition, parentId, fiveQIId);
            toast.success(`Added ${nodeType} node as child`);
          }
        } else {
          // Create as standalone node at safe position
          console.log(`useNodeDragDrop: Creating standalone ${nodeType} node at safe position:`, safePosition);
          addNode(nodeType, safePosition, fiveQIId);
          toast.success(`Added ${nodeType} node to canvas`);
        }
        
        setTimeout(() => {
          setIsProcessingDrop(false);
        }, 200);
      } catch (error) {
        console.error("useNodeDragDrop: Error during node drop:", error);
        toast.error("Failed to create node");
        setIsProcessingDrop(false);
      }
    },
    [reactFlowWrapper, reactFlowInstance, addNode, createChildNode, isProcessingDrop, validateParentChildRelationship]
  );

  return { onDragOver, onDrop };
};
