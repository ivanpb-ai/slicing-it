
import { Node } from '@xyflow/react';
import { resetCounters } from '../idCounters';
import { createInitialNetworkNode } from './initialNetworkNode';
import { createInitialCellAreaNode } from './initialCellAreaNode';
import { createInitialRrpNode } from './initialRrpNode';
import { createInitialSnssaiNode } from './initialSnssaiNode';
import { createInitialDnnNode } from './initialDnnNode';
import { createInitialFiveQiNode } from './initialFiveQiNode';

// Get initial nodes - reset counters here to ensure a clean state
export const getInitialNodes = (): Node[] => {
  // Reset counters for initial nodes
  resetCounters();
  console.log("Resetting global counters in getInitialNodes");
  
  const networkNode = createInitialNetworkNode();
  const cellAreaNode = createInitialCellAreaNode();
  const rrpNode = createInitialRrpNode();
  const sNssaiNode = createInitialSnssaiNode();
  const dnnNode = createInitialDnnNode();
  const fiveQINode = createInitialFiveQiNode();

  console.log("Initial Cell Area Node data:", cellAreaNode.data);
  
  return [
    networkNode,
    cellAreaNode,
    rrpNode,
    sNssaiNode,
    dnnNode,
    fiveQINode,
  ];
};
