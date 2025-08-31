
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
      
      // Reset immediately for better performance
      isProcessingRef.current = false;
    };
    
    const canvasClearedHandler = () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      console.log('Canvas cleared event received, handling...');
      handleCanvasCleared(reactFlowInstance);
      
      // Reset immediately for better performance  
      isProcessingRef.current = false;
    };
    
    // Handler for when a new node is added - lightweight
    const nodeAddedHandler = () => {
      if (isProcessingRef.current || !reactFlowInstance) return;
      isProcessingRef.current = true;
      
      console.log('Node added event received');
      
      // Reset immediately for better performance
      isProcessingRef.current = false;
    };
    
    // Add handler for arranged nodes - lightweight
    const nodesArrangedHandler = () => {
      if (isProcessingRef.current || !reactFlowInstance) return;
      isProcessingRef.current = true;
      
      console.log('Nodes arranged event received');
      
      // Reset immediately for better performance
      isProcessingRef.current = false;
    };
    
    // DISABLED HEAVY PROCESSING - this was causing performance issues
    const nodeRelationshipUpdateHandler = () => {
      if (isProcessingRef.current || !reactFlowInstance) return;
      isProcessingRef.current = true;
      
      console.log('Node relationship update event received (lightweight mode)');
      
      // Reset immediately - no heavy processing
      isProcessingRef.current = false;
    };
    
    // Add handler for storage loaded graphs - lightweight
    const storageGraphLoadedHandler = (event: CustomEvent) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsStorageLoaded(true);
      
      console.log('Storage graph loaded event received, handling...');
      
      // Use the dedicated handler for storage loaded graphs
      handleStorageGraphLoaded(reactFlowInstance);
      
      // Reset immediately for better performance
      isProcessingRef.current = false;
      setIsStorageLoaded(false);
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
