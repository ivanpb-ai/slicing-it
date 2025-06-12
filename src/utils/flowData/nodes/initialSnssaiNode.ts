
import { Node } from '@xyflow/react';
import { getNextSnssaiId } from '../idCounters';

export const createInitialSnssaiNode = (): Node => {
  const snssaiId = getNextSnssaiId();
  
  return {
    id: 's-nssai-1',
    type: 'customNode',
    position: { x: 250, y: 350 },
    data: {
      label: `S-NSSAI #${snssaiId}`,
      type: 's-nssai',
      description: 'Single Network Slice Selection Assistance Information',
      snssaiId: snssaiId,
      sd: '', // Service Differentiator
      sst: '', // Slice/Service Type
      snssaiCustomName: 'Enhanced Mobile Broadband' // Keep for backward compatibility
    },
  };
};
