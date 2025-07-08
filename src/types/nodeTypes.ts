
export type NodeType = 
  | 'network' 
  | 'cell-area' 
  | 'rrp' 
  | 's-nssai' 
  | 'dnn' 
  | 'fiveqi'
  | 'rrpmember';

export interface NodeData {
  label?: string;
  type?: NodeType;
  description?: string;
  nodeId?: string;
  id?: number;
  parentId?: number;
  fiveQIId?: string;
  snssaiId?: number;
  dnnId?: number;
  rrpId?: number;
  cellAreaId?: number;
  cellAreaDescription?: string;
  rrpPercentage?: number;
  rrpBands?: RrpBand[];
  rrpName?: string; // Add name field for RRP nodes
  plmn?: number; // Single PLMN field instead of plmn1 and plmn2
  plmnValue?: number; // Add PLMN value for RRPmember nodes
  notes?: string;
  qosValues?: QoSValues;
  // S-NSSAI specific fields
  sd?: string; // Service Differentiator
  sst?: string; // Slice/Service Type
  snssaiCustomName?: string; // Keep for backward compatibility
  [key: string]: any;
}

export interface NodeRelationship {
  parent: NodeType;
  child: NodeType;
  allowMultiple?: boolean;
}

// Add RrpBand interface for band data with DL and UL percentages
export interface RrpBand {
  name: string;
  dl: number; // Downlink percentage
  ul: number; // Uplink percentage
}

// Add QoSValues interface for 5QI data
export interface QoSValues {
  value: string;
  resourceType: string;
  priority: string;
  packetDelay: string;
  service: string;
}

// Add ConnectionRules type for connection rules
export interface ConnectionRules {
  [sourceType: string]: {
    [targetType: string]: {
      sourceHandle: string;
      targetHandle: string;
    }
  }
}
