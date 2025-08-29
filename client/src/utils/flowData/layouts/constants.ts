
export const HIERARCHY_LEVELS: { [key: string]: number } = {
  'network': 0,
  'cell-area': 1,
  'rrp': 2,
  'rrpmember': 3,  // One level below RRP (as children)
  's-nssai': 4,
  'dnn': 5,
  'fiveqi': 6
};

export const VERTICAL_SPACING = 150;
export const HORIZONTAL_SPACING = 200;
export const INITIAL_Y_OFFSET = 50;
export const INITIAL_X_OFFSET = 50;

// Add the missing VERTICAL_LEVEL_SPACINGS export
export const VERTICAL_LEVEL_SPACINGS: { [key: string]: number } = {
  'default': 150,
  'rrpmember-s-nssai': 150, // Consistent spacing for all connections
  's-nssai-dnn': 150, // Consistent spacing for all connections
  'rrp-rrpmember': 150, // Same as default for consistent edge lengths
  'network-cell-area': 150,
  'cell-area-rrp': 150,
  'dnn-fiveqi': 150
};
