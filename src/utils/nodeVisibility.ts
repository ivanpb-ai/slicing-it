
let visibilityCheckTimeout: NodeJS.Timeout | null = null;
let isVisibilityCheckInProgress = false;

export const initNodeVisibility = () => {
  console.log('NodeVisibility: Initializing node visibility system');
  
  const handleForceVisibility = () => {
    // Only check visibility if not already in progress
    if (isVisibilityCheckInProgress) {
      console.log('NodeVisibility: Skipping check - already in progress');
      return;
    }
    
    // Clear any pending timeout
    if (visibilityCheckTimeout) {
      clearTimeout(visibilityCheckTimeout);
    }
    
    // Set a longer timeout to batch visibility checks
    visibilityCheckTimeout = setTimeout(() => {
      forceNodeVisibility();
    }, 1000); // Reduced frequency
  };
  
  window.addEventListener('force-node-visibility', handleForceVisibility);
  
  return () => {
    window.removeEventListener('force-node-visibility', handleForceVisibility);
    if (visibilityCheckTimeout) {
      clearTimeout(visibilityCheckTimeout);
    }
  };
};

export const forceNodeVisibility = () => {
  if (isVisibilityCheckInProgress) {
    return;
  }
  
  isVisibilityCheckInProgress = true;
  
  try {
    const nodeElements = document.querySelectorAll('.react-flow__node');
    console.log(`NodeVisibility: Found ${nodeElements.length} node elements in DOM`);
    
    if (nodeElements.length === 0) {
      return;
    }
    
    // Only apply styles if nodes are actually invisible
    nodeElements.forEach((el) => {
      const element = el as HTMLElement;
      const computedStyle = window.getComputedStyle(element);
      
      // Only update if the node is actually invisible
      if (computedStyle.visibility === 'hidden' || computedStyle.opacity === '0' || computedStyle.display === 'none') {
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('display', 'flex', 'important');
        element.style.setProperty('opacity', '1', 'important');
      }
    });
    
    console.log('NodeVisibility: Visibility applied to invisible nodes only');
  } finally {
    // Reset the flag after a delay
    setTimeout(() => {
      isVisibilityCheckInProgress = false;
    }, 500);
  }
};

export const ensureNodeVisibility = (nodeId: string) => {
  const nodeElement = document.querySelector(`[data-id="${nodeId}"]`) as HTMLElement;
  if (nodeElement) {
    const computedStyle = window.getComputedStyle(nodeElement);
    
    // Only update if the node is actually invisible
    if (computedStyle.visibility === 'hidden' || computedStyle.opacity === '0' || computedStyle.display === 'none') {
      nodeElement.style.setProperty('visibility', 'visible', 'important');
      nodeElement.style.setProperty('display', 'flex', 'important');
      nodeElement.style.setProperty('opacity', '1', 'important');
    }
  }
};
