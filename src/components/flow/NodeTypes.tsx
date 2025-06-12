
import React from 'react';
import { NodeTypes } from '@xyflow/react';
import CustomNode from '@/components/CustomNode';

// Define node types in a separate file to avoid recreation on each render
const nodeTypes: NodeTypes = { 
  customNode: CustomNode
};

export default nodeTypes;
