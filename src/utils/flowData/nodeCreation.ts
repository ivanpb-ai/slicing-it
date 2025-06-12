
import { HIERARCHY_LEVELS, VERTICAL_SPACING, INITIAL_Y_OFFSET } from './layouts/constants';
import { Node } from '@xyflow/react';
import { NodeType } from '@/types/nodeTypes';

export const createNode = (
  type: NodeType,
  position: { x: number; y: number },
  parentId?: string,
  fiveQIId?: string
): Node => {
  // Calculate vertical position based on hierarchy level
  const verticalLevel = HIERARCHY_LEVELS[type];
  const yPosition = INITIAL_Y_OFFSET + (verticalLevel * VERTICAL_SPACING);

  const id = `${type}-${Date.now()}`;
  
  const nodeData: any = {
    label: type.toUpperCase(),
    type,
    parentId,
    fiveQIId,
    level: verticalLevel
  };
  
  // Set default RRP percentage for RRP nodes
  if (type === 'rrp') {
    nodeData.rrpPercentage = 100;
  }
  
  // Set PLMN value for RRPmember nodes - use fiveQIId as the PLMN value
  if (type === 'rrpmember' && fiveQIId) {
    nodeData.plmnValue = fiveQIId;
    nodeData.label = 'RRPmember';
  }
  
  const nodeStyle: any = {};
  
  // Apply larger size to RRP nodes
  if (type === 'rrp') {
    nodeStyle.width = '180px';
    nodeStyle.height = '180px';
  }
  
  return {
    id,
    type: 'customNode',
    position: { 
      x: position.x,
      y: yPosition // Use calculated vertical position
    },
    data: nodeData,
    style: nodeStyle
  };
};

/**
 * Check if a network node already exists in the node array
 */
export const hasNetworkNode = (nodes: Node[]): boolean => {
  // Properly handle type checking - make sure we're checking node.data.type
  const result = nodes.some((node) => node.data && node.data.type === 'network');
  console.log(`hasNetworkNode check: ${result ? 'Network node found' : 'No network node'}`);
  return result;
};
