
import { useCallback } from 'react';

interface CanvasOperationsProps {
  clearCanvas: () => void;
  initializeCanvas: () => void;
}

const CanvasOperations = ({ 
  clearCanvas, 
  initializeCanvas 
}: CanvasOperationsProps) => {
  // Clear the canvas
  const handleClearCanvas = useCallback(() => {
    console.log("Clear canvas action triggered");
    clearCanvas();
    // Dispatch canvas cleared event
    window.dispatchEvent(new CustomEvent('canvas-cleared'));
  }, [clearCanvas]);

  // Initialize with example data
  const handleInitializeCanvas = useCallback(() => {
    console.log("Initialize canvas with example data");
    initializeCanvas();
    // Dispatch initialization event
    window.dispatchEvent(new CustomEvent('canvas-initialized'));
  }, [initializeCanvas]);

  return {
    handleClearCanvas,
    handleInitializeCanvas
  };
};

export default CanvasOperations;
