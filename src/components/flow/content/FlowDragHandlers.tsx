
import React from 'react';

/**
 * Component that provides handlers for drag events in the flow
 */
const FlowDragHandlers = () => {
  // Optimize event handlers to debounce reactions
  const handleNodeDragStart = () => {
    window.dispatchEvent(new CustomEvent('drawing-started'));
  };
  
  const handleNodeDragStop = () => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('drawing-ended'));
    }, 300);
  };
  
  return { handleNodeDragStart, handleNodeDragStop };
};

export default FlowDragHandlers;
