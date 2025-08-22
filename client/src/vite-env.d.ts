
/// <reference types="vite/client" />

// Declare debug variables for the window object
declare global {
  interface Window {
    __DEBUG_NODE_EDITOR_NODES?: any[];
    __DEBUG_NODE_EDITOR_EDGES?: any[];
    __DEBUG_LAST_NODES?: any[];
    __DEBUG_LAST_EDGES?: any[];
    __DEBUG_DOM_NODES?: any[]; // Add this missing property
    __DEBUG_LOADING_RAW_NODES?: any[]; // Also add this for future use
    __DEBUG_LOADING_RAW_EDGES?: any[]; // And this for completeness
  }
}

export {}
