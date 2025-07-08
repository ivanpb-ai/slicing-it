
import { NodeData } from './nodeTypes';

export interface NodeHandlesProps {
  position?: 'top' | 'bottom';
  type?: 'source' | 'target';
}

export interface BaseNodeProps {
  data: NodeData;
  id: string;
}

export interface NodeLabelProps {
  type: string;
  displayId: string;
  fiveQIId?: string;
  cellAreaId?: number;
  rrpId?: number;
  snssaiId?: number;
  dnnId?: number;
}
