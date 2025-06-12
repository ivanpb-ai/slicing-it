import { NodeType } from '@/types/nodeTypes';

/**
 * Generates a unique ID for a node based on its type
 * @param type The type of node
 * @param fiveQIId Optional identifier (used for 5QI nodes or cell area ID)
 * @returns A unique ID string
 */
export const getNodeId = (type: NodeType, fiveQIId?: string): string => {
  // Generate a timestamp-based unique ID
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  
  // If it's a 5QI node and we have a fiveQIId, use that in the ID
  if (type === '5qi' && fiveQIId) {
    return `5qi-${fiveQIId}`;
  }
  
  // For cell-area nodes, create simpler IDs
  if (type === 'cell-area') {
    if (fiveQIId) {
      console.log(`Creating cell-area node ID with area ID: ${fiveQIId}`);
      return `cell-area-${fiveQIId}`;
    } else {
      return `cell-area-${timestamp}`;
    }
  }
  
  // Otherwise create a unique ID based on the node type
  return `${type}-${timestamp}-${randomSuffix}`;
};

/**
 * Extracts a user-friendly identifier from a node ID
 * @param nodeId The full node ID
 * @returns A shortened identifier suitable for display
 */
export const getDisplayId = (nodeId: string): string => {
  // Extract the unique part from the ID
  const parts = nodeId.split('-');
  
  // For cell-area nodes with embedded ID (cell-area-{id})
  if (parts[0] === 'cell' && parts[1] === 'area' && parts.length > 2) {
    return parts[2]; // Return the numeric ID part
  }
  
  if (parts.length >= 3) {
    // For timestamp-based IDs, use the last part (random suffix)
    return parts[parts.length - 1];
  }
  
  // For 5QI nodes, return the 5QI value
  if (parts[0] === '5qi' && parts.length > 1) {
    return parts[1];
  }
  
  // Fallback to last 5 characters of ID if we can't parse it
  return nodeId.slice(-5);
};
