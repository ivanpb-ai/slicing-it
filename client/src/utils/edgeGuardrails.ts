import { Edge, Node } from '@xyflow/react';

/**
 * Guardrail validator to enforce single S-NSSAI parent per DNN node
 * Removes extra S-NSSAI→DNN edges, keeping only the one matching the DNN's parentId
 */
export const validateDnnSingleParent = (edges: Edge[], nodes: Node[]): Edge[] => {
  console.log(`🛡️ DNN Guardrail: Validating ${edges.length} edges across ${nodes.length} nodes`);
  
  // Create node lookup map for efficiency
  const nodeMap = new Map<string, Node>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Find all DNN nodes
  const dnnNodes = nodes.filter(node => node.data?.type === 'dnn');
  console.log(`🛡️ DNN Guardrail: Found ${dnnNodes.length} DNN nodes to validate`);
  
  let edgesToRemove: Edge[] = [];
  
  // Check each DNN node for multiple S-NSSAI parents
  dnnNodes.forEach(dnnNode => {
    const dnnId = dnnNode.id;
    const expectedParentId = dnnNode.data?.parentId;
    
    // Find all S-NSSAI→DNN edges targeting this DNN
    const incomingSnssaiEdges = edges.filter(edge => {
      const sourceNode = nodeMap.get(edge.source);
      return edge.target === dnnId && sourceNode?.data?.type === 's-nssai';
    });
    
    if (incomingSnssaiEdges.length <= 1) {
      // Single or no parent - no issue
      return;
    }
    
    console.log(`🛡️ DNN Guardrail: DNN ${dnnId} has ${incomingSnssaiEdges.length} S-NSSAI parents. Expected parent: ${expectedParentId}`);
    
    // Determine which edge to keep
    let edgeToKeep: Edge | null = null;
    
    if (expectedParentId) {
      // Keep the edge that matches the expected parentId
      edgeToKeep = incomingSnssaiEdges.find(edge => edge.source === expectedParentId) || null;
      
      if (edgeToKeep) {
        console.log(`🛡️ DNN Guardrail: Keeping edge from expected parent ${expectedParentId} to ${dnnId}`);
      } else {
        console.warn(`🛡️ DNN Guardrail: No edge found from expected parent ${expectedParentId} to ${dnnId}, keeping first edge`);
        edgeToKeep = incomingSnssaiEdges[0];
      }
    } else {
      // No parentId specified, keep the first edge found
      console.warn(`🛡️ DNN Guardrail: DNN ${dnnId} has no parentId, keeping first S-NSSAI edge`);
      edgeToKeep = incomingSnssaiEdges[0];
    }
    
    // Mark all other edges for removal
    const edgesToMarkForRemoval = incomingSnssaiEdges.filter(edge => edge !== edgeToKeep);
    edgesToRemove.push(...edgesToMarkForRemoval);
    
    console.log(`🛡️ DNN Guardrail: Marking ${edgesToMarkForRemoval.length} extra S-NSSAI→DNN edges for removal from ${dnnId}`);
    edgesToMarkForRemoval.forEach(edge => {
      console.log(`  ❌ Removing: ${edge.source} → ${edge.target} (${edge.id})`);
    });
  });
  
  // Filter out the edges marked for removal
  const cleanedEdges = edges.filter(edge => !edgesToRemove.includes(edge));
  
  const removedCount = edges.length - cleanedEdges.length;
  if (removedCount > 0) {
    console.log(`🛡️ DNN Guardrail: Removed ${removedCount} invalid S-NSSAI→DNN edges`);
  } else {
    console.log(`🛡️ DNN Guardrail: No invalid edges found - all DNNs have single parents`);
  }
  
  return cleanedEdges;
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