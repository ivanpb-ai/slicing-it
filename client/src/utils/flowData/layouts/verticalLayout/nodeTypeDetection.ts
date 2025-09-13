
import { Node } from '@xyflow/react';

export const isDnn = (node: Node) => node.data?.type === 'dnn';
export const isQoSFlow = (node: Node) => node.data?.type === 'qosflow';
export const is5QI = (node: Node) => node.data?.type === 'fiveqi';
export const isSnssai = (node: Node) => node.data?.type === 's-nssai';
