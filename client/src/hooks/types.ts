
import { Node, Edge } from '@xyflow/react';

export interface SavedGraph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: number;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}
