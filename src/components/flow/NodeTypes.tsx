
import { NodeTypes } from '@xyflow/react';
import CustomNode from '../nodes/CustomNode';

// Define node types in a separate file to avoid recreation on each render
const nodeTypes: NodeTypes = { 
  customNode: CustomNode
};

export default nodeTypes;
