
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { findNonOverlappingPosition, getNodeDimensions } from '@/utils/flowData/positioning/nodeCollisionDetection';

interface NodeAdditionHandlerProps {
  reactFlowInstance: any | null;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  addNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "fiveqi", position: { x: number, y: number }, fiveQIId?: string) => void;
}

const NodeAdditionHandler = ({ 
  reactFlowInstance, 
  reactFlowWrapper, 
  addNode 
}: NodeAdditionHandlerProps) => {
  const [canAddNodes, setCanAddNodes] = useState(true);

  // Add a new node to the canvas with collision prevention
  const handleAddNode = useCallback(
    (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "fiveqi", fiveQIId?: string) => {
      if (!canAddNodes) {
        console.log('Node addition is temporarily disabled to prevent rapid additions');
        return;
      }
      
      if (!reactFlowWrapper.current) {
        console.error("reactFlowWrapper is not initialized!");
        return;
      }
      
      if (!reactFlowInstance) {
        console.error("reactFlowInstance is not available!");
        toast.error("Cannot add node - flow instance not ready");
        return;
      }
      
      // Get the center position of the viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Convert screen coordinates to flow coordinates
      const rawPosition = reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY
      });

      // Get existing nodes and find safe position
      const existingNodes = reactFlowInstance.getNodes();
      const dimensions = getNodeDimensions(type);
      
      const safePosition = findNonOverlappingPosition(
        rawPosition,
        existingNodes,
        dimensions.width,
        dimensions.height
      );

      console.log(`Adding ${type} node at safe position:`, safePosition, fiveQIId ? `with 5QI ID: ${fiveQIId}` : '');
      
      // Temporarily disable adding more nodes to prevent rapid additions
      setCanAddNodes(false);
      
      // For cell area nodes, additional offset if others exist
      if (type === 'cell-area') {
        // Find existing cell area nodes to calculate offset
        const existingCellAreas = existingNodes.filter(
          node => node.data?.type === 'cell-area'
        );
        
        if (existingCellAreas.length > 0) {
          // Use safe positioning with horizontal spread
          const offsetPosition = findNonOverlappingPosition(
            {
              x: safePosition.x + (existingCellAreas.length * 200),
              y: safePosition.y
            },
            existingNodes,
            dimensions.width,
            dimensions.height
          );
          safePosition.x = offsetPosition.x;
          safePosition.y = offsetPosition.y;
        }
      }
      
      // Create the node - all nodes created via toolbar are standalone (no hierarchy constraints)
      if (type === 'fiveqi') {
        // Make sure we're passing a string ID
        const validFiveQIId = fiveQIId ? String(fiveQIId) : undefined;
        console.log(`NodeAdditionHandler: Adding 5QI node with ID: ${validFiveQIId || 'undefined'}`);
        
        // CRITICAL: Call addNode with the explicit fiveQIId parameter
        addNode(type, safePosition, validFiveQIId);
        
        toast.success(`Added 5QI #${validFiveQIId} node to canvas`);
      } else {
        // For non-5QI nodes, no need to pass fiveQIId
        addNode(type, safePosition);
        toast.success(`Added ${type} node to canvas`);
      }
      
      // Trigger node-added event to ensure proper view fitting
      window.dispatchEvent(new CustomEvent('node-added'));
      
      // Re-enable node addition after a short delay
      setTimeout(() => {
        setCanAddNodes(true);
      }, 500);
    },
    [addNode, reactFlowInstance, canAddNodes, reactFlowWrapper],
  );

  return {
    handleAddNode
  };
};

export default NodeAdditionHandler;
