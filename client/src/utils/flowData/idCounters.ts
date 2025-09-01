// Counters for generating IDs - use numbers for consistent typing
let dnnCounter = 1;
let snssaiCounter = 1;
let rrpCounter = 1;
let cellAreaCounter = 1;

// Get the next DNN ID - return as number
export const getNextDnnId = (): number => {
  const id = dnnCounter;
  console.log(`Generated new DNN ID: ${id}`);
  dnnCounter++;
  return id;
};

// Get the next S-NSSAI ID - return as number
export const getNextSnssaiId = (): number => {
  const id = snssaiCounter;
  console.log(`Generated new S-NSSAI ID: ${id}`);
  snssaiCounter++;
  return id;
};

// Get the next Cell Area ID - return as number 
export const getNextCellAreaId = (): number => {
  const id = cellAreaCounter;
  console.log(`Generated new Cell Area ID: ${id}`);
  cellAreaCounter++;
  return id;
};

// Get the next RRP ID - return as number 
export const getNextRrpId = (): number => {
  const id = rrpCounter;
  console.log(`Generated new RRP ID: ${id}`);
  rrpCounter++;
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

    // Find the highest RRP ID
    const rrpNodes = nodes.filter(node => 
      node.data && node.data.type === 'rrp' && node.data.rrpId
    );
    
    if (rrpNodes.length > 0) {
      const highestRrpId = Math.max(...rrpNodes.map(node => parseInt(node.data.rrpId)));
      rrpCounter = highestRrpId + 1;
      console.log(`Updated RRP counter to: ${rrpCounter}`);
    }
    
    // Find the highest Cell Area ID - check both data.cellAreaId and extract from node.id
    const cellAreaNodes = nodes.filter(node => 
      node.data && node.data.type === 'cell-area'
    );
    
    // Cell Area nodes found for counter update
    
    if (cellAreaNodes.length > 0) {
      // Convert all cell area IDs to numbers and find the highest
      const cellAreaIds = cellAreaNodes.map(node => {
        // First try to get from data.cellAreaId (newly created nodes)
        if (node.data.cellAreaId !== undefined) {
          const id = node.data.cellAreaId;
          if (typeof id === 'number') {
            return id;
          } else if (typeof id === 'string' && !isNaN(parseInt(id))) {
            return parseInt(id);
          }
        }
        
        // Fallback: extract from node.id for imported nodes (e.g., "cell-area-1" -> 1)
        if (node.id && typeof node.id === 'string' && node.id.startsWith('cell-area-')) {
          const idMatch = node.id.match(/cell-area-(\d+)/);
          if (idMatch && idMatch[1]) {
            return parseInt(idMatch[1]);
          }
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
  rrpCounter = 1;
  cellAreaCounter = 1;
};
