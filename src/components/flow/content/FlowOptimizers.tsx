
import React from 'react';
import { Edge } from '@xyflow/react';
import { FlowOptimizer } from '../FlowOptimizer';
import { FlowParentChildVerifier } from '../FlowParentChildVerifier';
import CellAreaVisibilityMonitor from '../../nodes/CellAreaVisibilityMonitor';

interface FlowOptimizersProps {
  nodes: any[];
  edges: Edge[];
  onEdgesChange: (changes: any) => void;
}

/**
 * Component that handles all flow optimization features
 */
const FlowOptimizers: React.FC<FlowOptimizersProps> = ({ 
  nodes, 
  edges, 
  onEdgesChange 
}) => {
  return (
    <>
      <FlowOptimizer nodes={nodes} edges={edges} />
      <FlowParentChildVerifier nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} />
      <CellAreaVisibilityMonitor />
    </>
  );
};

export default FlowOptimizers;
