
import { memo, useEffect } from 'react';
import { NodeHandles } from '../common/NodeHandles';
import CellAreaNode from '../CellAreaNode';
import { BaseNodeProps } from '@/types/nodeComponents';
import { getBgColor, getBorderColor, getNodeShape, getPadding, getWidth } from "@/utils/nodeStyles";

export const CellAreaWrapper = memo(({ data, id }: BaseNodeProps) => {
  // Log the cell area data to help with debugging
  useEffect(() => {
    console.log(`CellAreaWrapper rendering with data:`, data);
    
    // Add more specific logging for cellAreaId to track its value and type
    if (data.cellAreaId !== undefined) {
      console.log(`Cell area ID: ${data.cellAreaId}, type: ${typeof data.cellAreaId}`);
    } else {
      console.log('Cell area ID is undefined');
      
      // Try to extract cell area ID from node ID as fallback
      if (id && id.includes('cell-area')) {
        const match = id.match(/cell-area-(\d+)/);
        if (match && match[1]) {
          const extractedId = parseInt(match[1]);
          console.log(`Extracted cell area ID ${extractedId} from node ID ${id}`);
          data.cellAreaId = extractedId;
        }
      }
    }
  }, [data, id, data.cellAreaId]);

  const bgColor = getBgColor(data.type);
  const borderColor = getBorderColor(data.type);
  const nodeShape = getNodeShape(data.type);
  const padding = getPadding(data.type);
  const width = getWidth(data.type);
  
  return (
    <div 
      className={`${bgColor} ${borderColor} ${nodeShape} ${padding} ${width} min-h-[120px] shadow-sm border-4 relative`}
      data-node-type={data.type}
      style={{ position: 'relative' }}
    >
      <NodeHandles position="top" type="target" />
      <CellAreaNode data={data} />
      <NodeHandles position="bottom" type="source" />
    </div>
  );
});

CellAreaWrapper.displayName = 'CellAreaWrapper';
