
import { Node } from '@xyflow/react';

export interface NodeRelationships {
  childrenMap: Record<string, string[]>;
  parentMap: Record<string, string>;
  rootNodes: Node[];
}

export interface NodeLevelData {
  levelNodes: Record<number, Node[]>;
  nodeLevels: Record<string, number>;
}

export interface SubtreeData {
  subtreeSize: Record<string, number>;
  // Added nodeWeights to give nodes specific weights for better spacing
  nodeWeights?: Record<string, number>;
}
