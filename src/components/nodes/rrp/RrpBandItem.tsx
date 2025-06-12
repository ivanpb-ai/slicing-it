
import { memo } from "react";
import { X } from "lucide-react";
import { RrpBand } from "@/types/nodeTypes";

interface RrpBandItemProps {
  band: RrpBand;
  index: number;
  editingBandIndex: number | null;
  editingField: 'name' | 'dl' | 'ul' | null;
  editValue: string;
  onFieldEdit: (index: number, field: 'name' | 'dl' | 'ul') => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldBlur: () => void;
  onRemove: (index: number) => void;
}

export const RrpBandItem = memo(({
  band,
  index,
  editingBandIndex,
  editingField,
  editValue,
  onFieldEdit,
  onFieldChange,
  onFieldBlur,
  onRemove
}: RrpBandItemProps) => {
  const displayName = band.name ? `Band ${index + 1}: ${band.name}` : `Band ${index + 1}`;
  
  return (
    <div className="border border-gray-200 rounded p-1.5 mt-1">
      <div className="flex items-center justify-between mb-1">
        {editingBandIndex === index && editingField === 'name' ? (
          <input
            type="text"
            value={editValue}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            placeholder="Band name..."
            className="text-xs p-1 flex-1 border border-gray-300 rounded text-center"
            autoFocus
          />
        ) : (
          <div 
            className="flex-1 cursor-pointer hover:bg-gray-100/50 p-1 rounded text-center"
            onClick={() => onFieldEdit(index, 'name')}
          >
            {displayName}
          </div>
        )}
        <button
          onClick={() => onRemove(index)}
          className="ml-1 text-red-500 hover:text-red-700"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <div className="text-xs text-gray-500 mb-0.5">DL %</div>
          {editingBandIndex === index && editingField === 'dl' ? (
            <input
              type="number"
              min="0"
              max="100"
              value={editValue}
              onChange={onFieldChange}
              onBlur={onFieldBlur}
              className="text-xs p-1 w-full border border-gray-300 rounded text-center"
              autoFocus
            />
          ) : (
            <div 
              className="cursor-pointer hover:bg-gray-100/50 p-1 rounded text-center"
              onClick={() => onFieldEdit(index, 'dl')}
            >
              {band.dl}%
            </div>
          )}
        </div>
        
        <div>
          <div className="text-xs text-gray-500 mb-0.5">UL %</div>
          {editingBandIndex === index && editingField === 'ul' ? (
            <input
              type="number"
              min="0"
              max="100"
              value={editValue}
              onChange={onFieldChange}
              onBlur={onFieldBlur}
              className="text-xs p-1 w-full border border-gray-300 rounded text-center"
              autoFocus
            />
          ) : (
            <div 
              className="cursor-pointer hover:bg-gray-100/50 p-1 rounded text-center"
              onClick={() => onFieldEdit(index, 'ul')}
            >
              {band.ul}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

RrpBandItem.displayName = 'RrpBandItem';
