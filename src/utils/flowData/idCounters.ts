
// Counters for generating IDs - use numbers for consistent typing
let dnnCounter = 1;
let snssaiCounter = 1;
let cellAreaCounter = 1;

// Get the next DNN ID - return as string since that's how it's used in the app
export const getNextDnnId = (): string => {
  return (dnnCounter++).toString();
};

// Get the next S-NSSAI ID - return as number
export const getNextSnssaiId = (): number => {
  return snssaiCounter++;
};

// Get the next Cell Area ID - return as number 
export const getNextCellAreaId = (): number => {
  const id = cellAreaCounter;
  console.log(`Generated new Cell Area ID: ${id}`);
  cellAreaCounter++;
  return id;
};

// Update counter values based on existing nodes
export const updateDnnCounter = (nodes: any[]): void => {
  console.log('Updating ID counters based on nodes:', nodes.length);
  
  try {
    // Find the highest DNN ID
    const dnnNodes = nodes.filter(node => 
      node.data && node.data.type === 'dnn' && node.data.dnnId
    );
    
    if (dnnNodes.length > 0) {
      const highestDnnId = Math.max(...dnnNodes.map(node => parseInt(node.data.dnnId)));
      dnnCounter = highestDnnId + 1;
      console.log(`Updated DNN counter to: ${dnnCounter}`);
    }
    
    // Find the highest S-NSSAI ID
    const snssaiNodes = nodes.filter(node => 
      node.data && node.data.type === 's-nssai' && node.data.snssaiId
    );
    
    if (snssaiNodes.length > 0) {
      const highestSnssaiId = Math.max(...snssaiNodes.map(node => parseInt(node.data.snssaiId)));
      snssaiCounter = highestSnssaiId + 1;
      console.log(`Updated S-NSSAI counter to: ${snssaiCounter}`);
    }
    
    // Find the highest Cell Area ID - ensure we get simple sequential numbers
    const cellAreaNodes = nodes.filter(node => 
      node.data && node.data.type === 'cell-area' && node.data.cellAreaId !== undefined
    );
    
    if (cellAreaNodes.length > 0) {
      // Convert all cell area IDs to numbers and find the highest
      const cellAreaIds = cellAreaNodes.map(node => {
        const id = node.data.cellAreaId;
        // Handle both simple numbers and any other formats
        if (typeof id === 'number') {
          return id;
        } else if (typeof id === 'string' && !isNaN(parseInt(id))) {
          return parseInt(id);
        }
        return 1; // Default fallback
      });
      
      if (cellAreaIds.length > 0) {
        const highestCellAreaId = Math.max(...cellAreaIds);
        cellAreaCounter = highestCellAreaId + 1;
        console.log(`Updated Cell Area counter to: ${cellAreaCounter} (highest ID found: ${highestCellAreaId})`);
      }
    }
  } catch (error) {
    console.error('Error updating ID counters:', error);
  }
};

// Reset all counters (useful when loading a new graph)
export const resetCounters = (): void => {
  console.log('Resetting all ID counters to 1');
  dnnCounter = 1;
  snssaiCounter = 1;
  cellAreaCounter = 1;
};
