
import { Node } from '@xyflow/react';

export const isDnn = (node: Node) => node.data?.type === 'dnn';
export const is5QI = (node: Node) => node.data?.type === '5qi';
export const isSnssai = (node: Node) => node.data?.type === 's-nssai';
