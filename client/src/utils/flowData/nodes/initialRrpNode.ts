
import { Node } from '@xyflow/react';
import { getNextRrpId } from '../idCounters';


export const createInitialRrpNode = (): Node => {
  const rrpId = getNextRrpId();
  console.log(`Initial RRP ID: ${rrpId}, type: ${typeof rrpId}`);

  return {
     position: { x: 350, y: 200 },
     id: `rrp-${rrpId}`,
     type: 'rrp',
     data: {
       label: `RRP #${rrpId}`,
       rrpDescription: `RRP ${rrpId}`,
       nodeId: `rrp-${rrpId}`,
       description: 'Radio Resource Partition',
       rrpPercentage: 100,
       rrpBands: [],
       plmn1: '',
       plmn2: '',
     },
 };
};
