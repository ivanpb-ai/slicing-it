
import { useCallback, useState, useRef } from 'react';
import { XYPosition, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { NodeType } from '@/types/nodeTypes';
import { detectParentNodeFromDOM, detectParentNodeFromPosition } from './useParentNodeDetection';
import { parseDragData } from './useDragDataParser';
import { useNodeRelationships } from '../node/useNodeRelationships';

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
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      console.log('Drop event triggered');
      
      isDraggingRef.current = false;
      
      if (isProcessingDrop) {
        console.log('Already processing a drop, ignoring');
        return;
      }
      
      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.error('ReactFlow wrapper or instance not available');
        return;
      }

      try {
        setIsProcessingDrop(true);
        
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        
        console.log('Drop position:', position);
        
        const dragDataString = event.dataTransfer.getData('text/plain');
        console.log('Drag data:', dragDataString);
        
        if (!dragDataString) {
          console.error('No drag data found');
          setIsProcessingDrop(false);
          return;
        }
        
        const parsedData = parseDragData(dragDataString);
        if (!parsedData) {
          console.error('Failed to parse drag data');
          setIsProcessingDrop(false);
          return;
        }
        
        const { nodeType, fiveQIId } = parsedData;
        console.log(`Creating ${nodeType} node at position:`, position, fiveQIId ? `with ID: ${fiveQIId}` : '');
        
        // Get all elements at the drop point
        const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
        
        // Try DOM-based parent detection first
        let parentId = detectParentNodeFromDOM(elementsAtPoint, event.clientX, event.clientY);
        
        // If no parent found with DOM, try position-based detection
        if (!parentId) {
          const allNodes = reactFlowInstance.getNodes();
          parentId = detectParentNodeFromPosition(allNodes, position);
        }
        
        // Create node with or without parent - with hierarchy validation
        if (parentId) {
          const allNodes = reactFlowInstance.getNodes();
          const parentNode = allNodes.find(n => n.id === parentId);
          
          // Validate the parent-child relationship according to hierarchy rules
          if (!validateParentChildRelationship(parentNode, nodeType)) {
            console.log(`Invalid hierarchy - cannot place ${nodeType} under ${parentNode?.data?.type}`);
            setIsProcessingDrop(false);
            return; // Validation failed, don't create the node
          }
          
          console.log(`Creating child ${nodeType} node under parent ${parentId} - THIS SHOULD CREATE AN EDGE`);
          
          if (parentNode) {
            // Position child directly below parent with vertical spacing
            const childPosition = {
              x: parentNode.position.x, // Same X to align vertically
              y: parentNode.position.y + 200  // 200px below the parent
            };
            console.log(`Child position directly below parent:`, childPosition);
            createChildNode(nodeType, childPosition, parentId, fiveQIId);
          } else {
            createChildNode(nodeType, position, parentId, fiveQIId);
          }
          
          toast.success(`Added ${nodeType} node as child of ${parentNode?.data?.type || 'parent'} node`);
        } else {
          console.log(`Creating standalone ${nodeType} node`);
          addNode(nodeType, position, fiveQIId);
          toast.success(`Added ${nodeType} node to canvas`);
        }
        
        setTimeout(() => {
          setIsProcessingDrop(false);
        }, 100);
        
      } catch (error) {
        console.error("Error during node drop:", error);
        toast.error("Failed to create node");
        setIsProcessingDrop(false);
      }
    },
    [reactFlowWrapper, reactFlowInstance, addNode, createChildNode, isProcessingDrop, validateParentChildRelationship]
  );

  return { onDragOver, onDrop };
};
