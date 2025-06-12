
export const HIERARCHY_LEVELS: { [key: string]: number } = {
  'network': 0,
  'cell-area': 1,
  'rrp': 2,
  'rrpmember': 3,
  's-nssai': 4,
  'dnn': 5,
  '5qi': 6
};

export const VERTICAL_SPACING = 150;
export const HORIZONTAL_SPACING = 200;
export const INITIAL_Y_OFFSET = 50;
export const INITIAL_X_OFFSET = 50;

// Add the missing VERTICAL_LEVEL_SPACINGS export
export const VERTICAL_LEVEL_SPACINGS: { [key: string]: number } = {
  'default': 120,
  'rrpmember-s-nssai': 113, // Max 3cm (113px) spacing for RRPmember to S-NSSAI connections
  's-nssai-dnn': 113, // Max 3cm (113px) spacing for S-NSSAI to DNN connections
  'rrp-rrpmember': 80,
  'network-cell-area': 140,
  'cell-area-rrp': 130,
  'dnn-5qi': 100
};
