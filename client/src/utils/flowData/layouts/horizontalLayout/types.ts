
import { Node, Edge } from '@xyflow/react';

/**
 * Configuration options for horizontal layout
 */
export interface HorizontalLayoutOptions {
  spacing?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  marginX?: number;
  marginY?: number;
  compactFactor?: number;
}

/**
 * Internal types for node relationships and tracking
 */
export interface NodeRelationships {
  childrenMap: Record<string, string[]>;
  parentMap: Record<string, string>;
  rootNodes: Node[];
}

/**
 * Internal types for level tracking
 */
export interface NodeLevelData {
  levelNodes: Record<number, Node[]>;
  nodeLevels: Record<string, number>;
}

/**
 * Internal types for node weight calculations
 */
export interface NodeWeightData {
  nodeWeight: Record<string, number>;
}
