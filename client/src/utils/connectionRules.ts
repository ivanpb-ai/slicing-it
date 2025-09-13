
import { Connection, NodeChange, EdgeChange, Node, Edge, MarkerType } from '@xyflow/react';
import { ConnectionRules, NodeType } from '../types/nodeTypes';
import { toast } from 'sonner';

// Define the rules for node connections - updated to allow multiple S-NSSAI to DNN connections
export const connectionRules: ConnectionRules = {
  'network': { 'cell-area': { sourceHandle: 'bottom-source', targetHandle: 'top-target' } },
  'cell-area': { 
    'network': { sourceHandle: 'top-target', targetHandle: 'bottom-source' },
    'rrp': { sourceHandle: 'bottom-source', targetHandle: 'top-target' } 
  },
  'rrp': { 
    'cell-area': { sourceHandle: 'top-target', targetHandle: 'bottom-source' },
    'rrpmember': { sourceHandle: 'bottom-source', targetHandle: 'top-target' } 
  },
  'rrpmember': { 
    'rrp': { sourceHandle: 'top-target', targetHandle: 'bottom-source' },
    's-nssai': { sourceHandle: 'bottom-source', targetHandle: 'top-target' } 
  },
  's-nssai': { 
    'rrpmember': { sourceHandle: 'top-target', targetHandle: 'bottom-source' },
    'dnn': { sourceHandle: 'bottom-source', targetHandle: 'top-target' } 
  },
  'dnn': { 
    's-nssai': { sourceHandle: 'top-target', targetHandle: 'bottom-source' },
    'qosflow': { sourceHandle: 'bottom-source', targetHandle: 'top-target' } 
  },
  'qosflow': { 
    'dnn': { sourceHandle: 'top-target', targetHandle: 'bottom-source' },
    'fiveqi': { sourceHandle: 'bottom-source', targetHandle: 'top-target' } 
  },
  'fiveqi': { 
    'qosflow': { sourceHandle: 'top-target', targetHandle: 'bottom-source' }
  }
};

// Helper function to get the appropriate handles for a connection between two node types
export const getHandlesForConnection = (sourceType: string, targetType: string): { sourceHandle: string, targetHandle: string } => {
  return { 
    sourceHandle: 'bottom-source', 
    targetHandle: 'top-target' 
  };
};

// Check if a connection is allowed based on the rules - updated to handle multiple S-NSSAI to DNN connections
export const isConnectionAllowed = (connection: Connection, nodes: Node[]): boolean => {
  try {
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      console.error('Source or target node not found');
      return false;
    }
    
    const sourceType = sourceNode.data?.type as NodeType | undefined;
    const targetType = targetNode.data?.type as NodeType | undefined;
    
    if (!sourceType || !targetType) {
      console.error('Source or target node type not defined');
      return false;
    }

    console.log(`Checking connection: ${sourceType} -> ${targetType}`);
    
    // Special handling for S-NSSAI to DNN connections - allow multiple
    if (sourceType === 's-nssai' && targetType === 'dnn') {
      console.log('Allowing S-NSSAI to DNN connection (multiple allowed)');
      return true;
    }

    // Check if connection is allowed by rules
    const isAllowed = connectionRules[sourceType] && connectionRules[sourceType][targetType];
    
    if (!isAllowed) {
      console.error(`Connection from ${sourceType} to ${targetType} is not allowed by hierarchy rules`);
      toast.error(`Invalid connection`, {
        description: `${sourceType} nodes cannot connect to ${targetType} nodes according to the hierarchy.`
      });
      return false;
    }
    
    console.log(`Connection ${sourceType} -> ${targetType} is allowed`);
    return true;
  } catch (error) {
    console.error('Error validating connection:', error);
    return false;
  }
};

// Validate a connection based on the rules
export const isValidConnection = (connection: Connection, nodes: Node[]): boolean => {
  return isConnectionAllowed(connection, nodes);
};

// Create a validated edge from a connection with normal visibility
export const createEdgeFromConnection = (connection: Connection): Edge => {
  const sourceHandle = connection.sourceHandle || 'bottom-source';
  const targetHandle = connection.targetHandle || 'top-target';
  
  console.log(`createEdgeFromConnection: Creating visible edge with handles ${sourceHandle} -> ${targetHandle}`);
  
  return {
    id: `e-${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: sourceHandle,
    targetHandle: targetHandle,
    type: 'smoothstep',
    animated: false,
    style: { 
      stroke: '#94a3b8', 
      strokeWidth: 2,
      opacity: 1
    },
    data: {
      persistent: true,
      permanent: true,
      preserveEdge: true,
      visible: true
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 8,
      height: 8,
      color: '#94a3b8',
    },
  };
};
