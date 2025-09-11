import { Edge, Node } from '@xyflow/react';

/**
 * Universal guardrail validator - LENIENT for imports
 * Only removes obviously invalid edges, preserves intentional multi-parent connections for all node types
 */
export const validateUniversalGuardrails = (edges: Edge[], nodes: Node[]): Edge[] => {
  console.log(`🛡️ Universal Guardrail: Validating ${edges.length} edges across ${nodes.length} nodes (LENIENT mode)`);
  
  // Create node lookup map for efficiency
  const nodeMap = new Map<string, Node>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Only remove edges that target non-existent nodes or have invalid structure
  const validEdges = edges.filter(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    // Remove edges to non-existent nodes
    if (!sourceNode || !targetNode) {
      console.log(`🛡️ Universal Guardrail: Removing edge to non-existent node: ${edge.source} → ${edge.target}`);
      return false;
    }
    
    // Keep all other edges - allow multi-parent connections for imports (all node types)
    return true;
  });
  
  const removedCount = edges.length - validEdges.length;
  if (removedCount > 0) {
    console.log(`🛡️ Universal Guardrail: Removed ${removedCount} invalid edges (node existence check only)`);
  } else {
    console.log(`🛡️ Universal Guardrail: All edges valid - preserving multi-parent connections for all node types`);
  }
  
  return validEdges;
};

/**
 * Comprehensive edge validation that can be called after imports, loads, or any operation
 * that might bypass the unified edge manager
 */
export const validateAllEdges = (edges: Edge[], nodes: Node[]): Edge[] => {
  console.log(`🛡️ Edge Guardrails: Starting comprehensive validation`);
  
  // Run universal guardrail validation
  const validatedEdges = validateUniversalGuardrails(edges, nodes);
  
  // Add other validations here as needed in the future
  
  console.log(`🛡️ Edge Guardrails: Validation complete`);
  return validatedEdges;
};