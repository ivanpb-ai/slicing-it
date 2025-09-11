import { Edge, Node } from '@xyflow/react';

/**
 * Guardrail validator for DNN nodes - LENIENT for imports
 * Only removes obviously invalid edges, preserves intentional multi-parent connections
 */
export const validateDnnSingleParent = (edges: Edge[], nodes: Node[]): Edge[] => {
  console.log(`🛡️ DNN Guardrail: Validating ${edges.length} edges across ${nodes.length} nodes (LENIENT mode)`);
  
  // Create node lookup map for efficiency
  const nodeMap = new Map<string, Node>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Only remove edges that target non-existent nodes or have invalid structure
  const validEdges = edges.filter(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    // Remove edges to non-existent nodes
    if (!sourceNode || !targetNode) {
      console.log(`🛡️ DNN Guardrail: Removing edge to non-existent node: ${edge.source} → ${edge.target}`);
      return false;
    }
    
    // Keep all other edges - allow multi-parent DNN connections for imports
    return true;
  });
  
  const removedCount = edges.length - validEdges.length;
  if (removedCount > 0) {
    console.log(`🛡️ DNN Guardrail: Removed ${removedCount} invalid edges (node existence check only)`);
  } else {
    console.log(`🛡️ DNN Guardrail: All edges valid - preserving multi-parent DNN connections`);
  }
  
  return validEdges;
};

/**
 * Comprehensive edge validation that can be called after imports, loads, or any operation
 * that might bypass the unified edge manager
 */
export const validateAllEdges = (edges: Edge[], nodes: Node[]): Edge[] => {
  console.log(`🛡️ Edge Guardrails: Starting comprehensive validation`);
  
  // Run DNN single-parent validation
  const dnnValidatedEdges = validateDnnSingleParent(edges, nodes);
  
  // Add other validations here as needed in the future
  
  console.log(`🛡️ Edge Guardrails: Validation complete`);
  return dnnValidatedEdges;
};