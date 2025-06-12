
import { Node } from '@xyflow/react';
import { getNextCellAreaId } from '../idCounters';

export const createInitialCellAreaNode = (): Node => {
  // Generate a simple numeric ID for the cell area
  const cellAreaId = getNextCellAreaId();
  console.log(`Initial Cell Area ID: ${cellAreaId}, type: ${typeof cellAreaId}`);
  
  return {
    id: `cell-area-${cellAreaId}`,
    type: 'customNode',
    position: { x: 150, y: 200 },
    data: {
      label: `TAC #${cellAreaId}`,
      type: 'cell-area',
      description: `TAC ${cellAreaId}`,
      cellAreaId: cellAreaId,
      cellAreaDescription: `TAC ${cellAreaId}`,
      nodeId: `cell-area-${cellAreaId}`,
    },
  };
};
