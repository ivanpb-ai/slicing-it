
import { useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { handleGraphLoaded, handleCanvasCleared, handleStorageGraphLoaded } from '../../utils/flowEvents';

export function useFlowEvents() {
  const reactFlowInstance = useReactFlow();
  // Using a ref to track processing state to prevent stale closures in event handlers
  const isProcessingRef = useRef(false);
  // Add a state to track if we're handling a storage-loaded graph
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  
  useEffect(() => {
    // Create handlers with guards against multiple rapid executions
    const graphLoadedHandler = () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      console.log('Graph loaded event received, handling...');
      handleGraphLoaded(reactFlowInstance);
      
      // Reset the flag after a delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    };
    
    const canvasClearedHandler = () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      console.log('Canvas cleared event received, handling...');
      handleCanvasCleared(reactFlowInstance);
      
      // Reset the flag after a delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    };
    
    // Handler for when a new node is added - no longer auto fits view
    const nodeAddedHandler = () => {
      if (isProcessingRef.current || !reactFlowInstance) return;
      isProcessingRef.current = true;
      
      console.log('Node added event received');
      
      // Reset the flag after completion
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    };
    
    // Add handler for arranged nodes - no longer auto fits view
    const nodesArrangedHandler = () => {
      if (isProcessingRef.current || !reactFlowInstance) return;
      isProcessingRef.current = true;
      
      console.log('Nodes arranged event received');
      
      // Reset the flag after completion
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    };
    
    // Add handler for node relationship updates (new event)
    const nodeRelationshipUpdateHandler = () => {
      if (isProcessingRef.current || !reactFlowInstance) return;
      isProcessingRef.current = true;
      
      console.log('Node relationship update event received, checking edges...');
      
      // Check edges and make any necessary repairs
      setTimeout(() => {
        if (reactFlowInstance) {
          // Get all nodes and edges
          const nodes = reactFlowInstance.getNodes();
          const edges = reactFlowInstance.getEdges();
          
          console.log(`Checking relationships for ${nodes.length} nodes and ${edges.length} edges`);
          
          // Look for any missing parent-child edges
          const childNodes = nodes.filter(node => node.parentId); // Fixed: Changed parentNode to parentId
          
          childNodes.forEach(childNode => {
            const parentId = childNode.parentId; // Fixed: Changed parentNode to parentId
            if (parentId) {
              // Check if an edge exists between this parent and child
              const edgeExists = edges.some(edge => 
                edge.source === parentId && edge.target === childNode.id
              );
              
              if (!edgeExists) {
                console.log(`Missing edge from ${parentId} to ${childNode.id}, triggering edge recreation`);
                // Dispatch an event to trigger edge recreation
                window.dispatchEvent(new CustomEvent('edge-created'));
              }
            }
          });
        }
        
        // Reset the processing flag
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 300);
      }, 200);
    };
    
    // Add handler for storage loaded graphs
    const storageGraphLoadedHandler = (event: CustomEvent) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsStorageLoaded(true);
      
      console.log('Storage graph loaded event received, handling...');
      
      // Use the dedicated handler for storage loaded graphs
      handleStorageGraphLoaded(reactFlowInstance);
      
      // Reset processing flag after a sufficient delay
      setTimeout(() => {
        isProcessingRef.current = false;
        setIsStorageLoaded(false);
      }, 1500);
    };
    
    window.addEventListener('graph-loaded', graphLoadedHandler);
    window.addEventListener('canvas-cleared', canvasClearedHandler);
    window.addEventListener('node-added', nodeAddedHandler);
    window.addEventListener('nodes-arranged', nodesArrangedHandler);
    window.addEventListener('node-relationship-update', nodeRelationshipUpdateHandler);
    window.addEventListener('storage-graph-loaded', storageGraphLoadedHandler as EventListener);
    
    return () => {
      window.removeEventListener('graph-loaded', graphLoadedHandler);
      window.removeEventListener('canvas-cleared', canvasClearedHandler);
      window.removeEventListener('node-added', nodeAddedHandler);
      window.removeEventListener('nodes-arranged', nodesArrangedHandler);
      window.removeEventListener('node-relationship-update', nodeRelationshipUpdateHandler);
      window.removeEventListener('storage-graph-loaded', storageGraphLoadedHandler as EventListener);
    };
  }, [reactFlowInstance]);

  return { reactFlowInstance, isStorageLoaded };
}
