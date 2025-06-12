
import { Node } from '@xyflow/react';
import { getNextDnnId } from '../idCounters';

export const createInitialDnnNode = (): Node => {
  const dnnId = getNextDnnId();
  
  return {
    id: 'dnn-1',
    type: 'customNode',
    position: { x: 250, y: 500 },
    data: {
      label: `DNN #${dnnId}`,
      type: 'dnn',
      description: 'Data Network Name',
      dnnId: dnnId,
    },
  };
};
