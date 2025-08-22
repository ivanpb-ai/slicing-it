
import { Node } from '@xyflow/react';
import { getNextSnssaiId } from '../idCounters';

export const createInitialSnssaiNode = (): Node => {
  const snssaiId = getNextSnssaiId();
  
  return {
    id: '${snssaiId}',
    type: 'S-NSSAI',
    position: { x: 250, y: 350 },
    data: {
      label: `S-NSSAI #${snssaiId}`,
      description: 'Single Network Slice Selection Assistance Information',
      snssaiId: snssaiId,
      nodeId: 'S-NSSAI-${snssaiId}',
      sd: '', // Service Differentiator
      sst: '', // Slice/Service Type
      snssaiCustomName: 'Initial S-NSSAI type' // Keep for backward compatibility
    },
  };
};
