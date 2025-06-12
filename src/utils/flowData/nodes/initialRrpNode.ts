
import { Node } from '@xyflow/react';

export const createInitialRrpNode = (): Node => ({
  id: 'rrp-1',
  type: 'customNode',
  position: { x: 350, y: 200 },
  data: {
    label: 'RRP',
    type: 'rrp',
    description: 'Radio Resource Partition',
    rrpName: 'RRP-1', // Default name
    rrpPercentage: 100,
    rrpBands: [],
    plmn1: '',
    plmn2: '',
  },
});
