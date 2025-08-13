// Counters for generating IDs - use numbers for consistent typing
let dnnCounter = 1;
let snssaiCounter = 1;
let rrpCounter = 1;
let cellAreaCounter = 1;

// Get the next DNN ID - return as number
export const getNextDnnId = (): number => {
  return dnnCounter++;
};

// Get the next S-NSSAI ID - return as number
export const getNextSnssaiId = (): number => {
  return snssaiCounter++;
};

// Get the next Cell Area ID - return as number
export const getNextCellAreaId = (): number => {
  return cellAreaCounter++;
};

// Get the next RRP ID - return as number
export const getNextRrpId = (): number => {
  return rrpCounter++;
};

// Reset all counters (useful when loading a new graph)
export const resetCounters = (): void => {
  dnnCounter = 1;
  snssaiCounter = 1;
  rrpCounter = 1;
  cellAreaCounter = 1;
};
