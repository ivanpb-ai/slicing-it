
import { toast } from "sonner";
import { Node, Edge, ReactFlowInstance } from "@xyflow/react";

// Debounce helper to prevent multiple rapid calls
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return function(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Track if we've already shown a success toast for the current operation
let graphLoadToastShown = false;

// Function to reset the toast flag when starting a new operation
export const resetGraphLoadToast = () => {
  graphLoadToastShown = false;
};
// Flag to prevent multiple event processing
let isProcessingEvent = false;

/**
 * Updates the React Flow instance with viewport and view fitting when a graph is loaded
 */
export const handleGraphLoaded = debounce((reactFlowInstance: ReactFlowInstance) => {
  if (!reactFlowInstance || isProcessingEvent) {
    console.warn('ReactFlow instance not available or already processing an event');
    return;
  }
  
  isProcessingEvent = true;
  console.log('Graph loaded event detected, updating view');
  
  // First ensure the viewport is reset (unless prevented by manual layout)
  if (!window.sessionStorage.getItem('prevent-fitview')) {
    console.log('Resetting viewport in response to graph-loaded event');
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
  }
  
  // Then fit view with a delay to ensure nodes are rendered
  setTimeout(() => {
    try {
      console.log('Fitting view in response to graph-loaded event');
      reactFlowInstance.fitView({ 
        padding: 0.2,
        includeHiddenNodes: false,
        duration: 500 // Shorter animation for better performance
      });
    } catch (error) {
      console.error('Error fitting view:', error);
    }
    
    // Reset the toast flag and processing flag after a suitable delay
    setTimeout(() => {
      graphLoadToastShown = false;
      isProcessingEvent = false;
    }, 1000);
  }, 300);
}, 500);

/**
 * Resets the ReactFlow viewport when canvas is cleared
 */
export const handleCanvasCleared = debounce((reactFlowInstance: ReactFlowInstance) => {
  if (!reactFlowInstance || isProcessingEvent) {
    console.warn('ReactFlow instance not available or already processing an event');
    return;
  }
  
  isProcessingEvent = true;
  console.log('Canvas cleared event detected, resetting ReactFlow');
  // Reset ReactFlow instance view after canvas is cleared (unless prevented by manual layout)
  if (!window.sessionStorage.getItem('prevent-fitview')) {
    console.log('Resetting viewport in response to canvas-cleared event');
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
  }
  
  // Reset processing flag
  setTimeout(() => {
    isProcessingEvent = false;
  }, 500);
}, 500);

/**
 * Initializes the canvas with nodes and edges, adjusting viewport as needed
 */
export const initializeCanvasWithNodes = (
  initialNodes?: Node[],
  initialEdges?: Edge[],
  reactFlowInstance?: ReactFlowInstance,
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>,
  initializeCanvas?: () => string,
  setInitialized?: React.Dispatch<React.SetStateAction<boolean>>,
  initialized?: boolean,
  nodes?: Node[]
) => {
  if (isProcessingEvent) {
    console.warn('Already processing an event, skipping initializeCanvasWithNodes');
    return;
  }
  
  isProcessingEvent = true;
  
  if (initialNodes && initialNodes.length > 0) {
    console.log("Initializing with provided nodes:", initialNodes.length);
    
    // Ensure reactFlowInstance is ready and viewport is reset
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
    }
    
    // Copy the nodes to ensure we don't have any reference issues
    const clonedNodes = JSON.parse(JSON.stringify(initialNodes));
    const clonedEdges = initialEdges ? JSON.parse(JSON.stringify(initialEdges)) : [];
    
    // Ensure all nodes have the correct type set
    const processedNodes = clonedNodes.map((node: Node) => ({
      ...node,
      type: 'customNode', // Ensure consistent node type
      // Ensure position is valid
      position: {
        x: typeof node.position?.x === 'number' ? node.position.x : 0,
        y: typeof node.position?.y === 'number' ? node.position.y : 0
      },
      // Ensure data property is always an object
      data: {
        ...(node.data || {}),
        // Make sure the node has a type in its data
        type: node.data?.type || 'generic'
      }
    }));
    
    if (setNodes && setEdges) {
      setNodes(processedNodes);
      setEdges(clonedEdges);
      
      // Only show toast if we haven't already shown one for this load operation and we have node count info
      if (!graphLoadToastShown) {
        toast.success(`Graph loaded successfully with ${processedNodes.length} nodes and ${clonedEdges.length} edges`, {
          style: {
            color: '#000000 !important',
            backgroundColor: '#ffffff !important',
            border: '1px solid #e0e0e0 !important',
            fontSize: '14px !important',
            fontWeight: '500 !important'
          },
          className: 'custom-success-toast'
        });
        graphLoadToastShown = true;
      }
      
      if (setInitialized) setInitialized(true);
      
      // Reset view to fit all nodes with a shorter delay
      setTimeout(() => {
        if (reactFlowInstance) {
          console.log('Fitting view after initial loading');
          reactFlowInstance.fitView({ 
            padding: 0.2,
            includeHiddenNodes: false,
            duration: 500
          });
          
          // Reset processing flag
          setTimeout(() => {
            isProcessingEvent = false;
          }, 500);
        }
      }, 300);
    }
  } else if (!initialized && nodes && nodes.length === 0 && initializeCanvas && setInitialized) {
    console.log("No initial nodes provided, using default initialization");
    initializeCanvas();
    setInitialized(true);
    
    // Reset processing flag
    setTimeout(() => {
      isProcessingEvent = false;
    }, 500);
  } else {
    // Reset processing flag if we didn't do anything
    isProcessingEvent = false;
  }
};

// Handle storage-loaded graphs specifically with enhanced error handling
export const handleStorageGraphLoaded = debounce((reactFlowInstance: ReactFlowInstance) => {
  if (!reactFlowInstance || isProcessingEvent) {
    console.warn('ReactFlow instance not available or already processing an event');
    return;
  }
  
  isProcessingEvent = true;
  console.log('Storage graph loaded event detected, updating view');
  
  try {
    // Force re-render the flow by updating viewport
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
    
    // Wait for storage graphs with simplified sequence
    setTimeout(() => {
      try {
        // Fit view with a simple approach (unless prevented by manual layout)
        if (!window.sessionStorage.getItem('prevent-fitview')) {
          reactFlowInstance.fitView({ 
            padding: 0.2,
            includeHiddenNodes: false,
            duration: 500
          });
        }
        
        // Reset processing flag
        setTimeout(() => {
          console.log('Completed storage graph loading sequence');
          isProcessingEvent = false;
        }, 500);
      } catch (err) {
        console.error('Error in storage graph loading:', err);
        isProcessingEvent = false;
      }
    }, 400);
  } catch (err) {
    console.error('Error in first phase of storage graph loading:', err);
    isProcessingEvent = false;
  }
}, 500);
