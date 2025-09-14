
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
  createChildNode: (type: NodeType, position: XYPosition, parentId: string, fiveQIId?: string) => void,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  arrangeNodesInLayout?: () => void
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
              console.log(`🎯 useNodeDragDrop: Calling createChildNode for 5QI at position:`, childPosition);
              createChildNode(nodeType, childPosition, parentId, fiveQIId);
              console.log(`🎯 useNodeDragDrop: createChildNode call completed for 5QI`);
              
              // Trigger layout to properly space siblings
              if (arrangeNodesInLayout) {
                setTimeout(() => {
                  console.log('🎯 useNodeDragDrop: Triggering layout after 5QI creation');
                  arrangeNodesInLayout();
                }, 100);
              }
              
              toast.success(`Added 5QI ${fiveQIId || 'node'} as child of DNN node`);
            } 
            // Special positioning for DNN nodes under S-NSSAI nodes
            else if (nodeType === 'dnn' && parentNode.data?.type === 's-nssai') {
              console.log(`🎯 useNodeDragDrop: Creating DNN node under S-NSSAI ${parentId}`);
              // Find existing DNN children of this S-NSSAI parent
              const existingDnnChildren = existingNodes.filter(node => 
                node.data?.parentId === parentId && node.data?.type === 'dnn'
              );
              console.log(`🎯 useNodeDragDrop: Found ${existingDnnChildren.length} existing DNN children for S-NSSAI ${parentId}`);
              
              const spacing = 300; // Much larger spacing between DNN nodes to ensure no overlap
              const totalNodes = existingDnnChildren.length + 1; // Include the new node
              
              // Simple approach: Start from a fixed offset to the left of parent, then space out
              const baseStartX = parentNode.position.x - 200; // Start further left of parent
              
              // Position the new node at the end of the sequence
              const childPosition = {
                x: baseStartX + (existingDnnChildren.length * spacing),
                y: parentNode.position.y + 200  // Position vertically below with spacing
              };
              
              console.log(`useNodeDragDrop: Positioning DNN node #${totalNodes} at x=${childPosition.x}, y=${childPosition.y} (${existingDnnChildren.length} existing siblings)`);
              
              // Create the new DNN node first
              console.log(`🎯 useNodeDragDrop: Calling createChildNode for DNN at position:`, childPosition);
              createChildNode(nodeType, childPosition, parentId, fiveQIId);
              console.log(`🎯 useNodeDragDrop: createChildNode call completed for DNN`);
              
              // Trigger layout to properly space siblings after DNN creation
              if (arrangeNodesInLayout) {
                setTimeout(() => {
                  console.log('🎯 useNodeDragDrop: Triggering layout after DNN creation');
                  arrangeNodesInLayout();
                }, 150);
              }
              
              // IMPORTANT: Reposition existing DNN siblings to maintain symmetry
              // Use multiple attempts to ensure ReactFlow updates properly
              setTimeout(() => {
                if (reactFlowInstance) {
                  console.log(`useNodeDragDrop: Starting repositioning of ${existingDnnChildren.length} DNN siblings`);
                  
                  const currentNodes = reactFlowInstance.getNodes();
                  console.log(`useNodeDragDrop: Found ${currentNodes.length} total nodes for repositioning`);
                  
                  // Update positions of existing DNN siblings
                  const updatedNodes = currentNodes.map(node => {
                    if (node.data?.parentId === parentId && node.data?.type === 'dnn' && node.id !== `dnn-${totalNodes}`) {
                      const siblingIndex = existingDnnChildren.findIndex(sibling => sibling.id === node.id);
                      if (siblingIndex !== -1) {
                        const newSiblingX = baseStartX + (siblingIndex * spacing);
                        console.log(`useNodeDragDrop: Repositioning DNN sibling ${node.id} from x=${node.position.x} to x=${newSiblingX}`);
                        return {
                          ...node,
                          position: {
                            x: newSiblingX,
                            y: parentNode.position.y + 200
                          }
                        };
                      }
                    }
                    return node;
                  });
                  
                  // Apply the updated positions using React state - ReactFlow will automatically sync
                  console.log(`useNodeDragDrop: Applying repositioning for ${existingDnnChildren.length} DNN siblings directly (avoiding 0-node state)`);
                  setNodes(updatedNodes);
                  console.log(`useNodeDragDrop: Applied repositioning for ${existingDnnChildren.length} DNN siblings`);
                }
              }, 200); // Longer delay to ensure the new node is fully rendered
              
              toast.success(`Added DNN node as child of S-NSSAI node with proper spacing`);
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
              
              // Trigger layout to properly space siblings - CRITICAL for RRP siblings under TAC
              if (arrangeNodesInLayout) {
                setTimeout(() => {
                  console.log(`🎯 useNodeDragDrop: Triggering layout after ${nodeType} creation (fixes sibling overlap)`);
                  arrangeNodesInLayout();
                }, 100);
              }
              
              toast.success(`Added ${nodeType} node as child of ${parentNode.data?.type || 'parent'} node`);
            }
          } else {
            console.log('useNodeDragDrop: Parent node not found in ReactFlow instance, creating at safe position');
            createChildNode(nodeType, safePosition, parentId, fiveQIId);
            
            // Trigger layout to properly space siblings
            if (arrangeNodesInLayout) {
              setTimeout(() => {
                console.log('🎯 useNodeDragDrop: Triggering layout after fallback child creation');
                arrangeNodesInLayout();
              }, 100);
            }
            
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
    [reactFlowWrapper, reactFlowInstance, addNode, createChildNode, isProcessingDrop, validateParentChildRelationship, arrangeNodesInLayout]
  );

  return { onDragOver, onDrop };
};
