
import { Node } from '@xyflow/react';
import { getNextDnnId } from '../idCounters';

export const createInitialDnnNode = (): Node => {
  const dnnId = getNextDnnId();
  
  return {
    id: '${dnnId}',
    type: 'DNN',
    position: { x: 250, y: 500 },
    data: {
      label: `DNN #${dnnId}`,
      description: 'Data Network Name',
      dnnId: dnnId,
      nodeId: 'DNN-${dnnId}',
    },
  };
};
