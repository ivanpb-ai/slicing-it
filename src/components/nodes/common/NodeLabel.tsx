
import { memo } from 'react';
import NodeIcon from '../NodeIcon';
import { NodeLabelProps } from '@/types/nodeComponents';

export const NodeLabel = memo(({ type, displayId, fiveQIId, cellAreaId, snssaiId, dnnId }: NodeLabelProps) => {
  const getFormattedLabel = () => {
    if (type === "rrp") {
      return "RRP";
    }
    
    let idNumber = "";
    
    switch (type) {
      case "network":
        idNumber = "1";
        break;
      case "cell-area":
        idNumber = cellAreaId !== undefined ? String(cellAreaId) : displayId;
        return `TAC #${idNumber}`;
        break;
      case "s-nssai":
        idNumber = snssaiId !== undefined ? String(snssaiId) : displayId;
        break;
      case "dnn":
        idNumber = dnnId || displayId;
        break;
      case "5qi":
        if (fiveQIId) {
          idNumber = String(fiveQIId);
        } else {
          idNumber = displayId;
        }
        break;
      default:
        idNumber = displayId;
    }
    
    const nodeType = type.toUpperCase();
    return `${nodeType} #${idNumber}`;
  };

  return (
    <div className="flex items-center gap-2 mb-2 justify-center">
      <NodeIcon nodeType={type} />
      <div className="font-medium text-sm">
        {getFormattedLabel()}
      </div>
    </div>
  );
});

NodeLabel.displayName = 'NodeLabel';
