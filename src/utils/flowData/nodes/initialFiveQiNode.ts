
import { Node } from '@xyflow/react';
import { fiveQIValues } from '../data/fiveQIData';

export const createInitialFiveQiNode = (): Node => ({
  id: '5qi-1',
  type: 'customNode',
  position: { x: 250, y: 650 },
  data: {
    label: '5QI #1',
    type: '5qi',
    description: '5G QoS Identifier',
    qosValues: fiveQIValues[0],
  },
});
