
import { memo } from "react";
import { Plus } from "lucide-react";
import { RrpBand } from "@/types/nodeTypes";
import { RrpBandItem } from "./RrpBandItem";

interface RrpBandsProps {
  bands: RrpBand[];
  editingBandIndex: number | null;
  editingField: 'name' | 'dl' | 'ul' | null;
  editValue: string;
  onFieldEdit: (index: number, field: 'name' | 'dl' | 'ul') => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldBlur: () => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

export const RrpBands = memo(({
  bands,
  editingBandIndex,
  editingField,
  editValue,
  onFieldEdit,
  onFieldChange,
  onFieldBlur,
  onRemove,
  onAdd
}: RrpBandsProps) => {
  return (
    <div className="mt-1">
      {bands.map((band, index) => (
        <RrpBandItem
          key={index}
          band={band}
          index={index}
          editingBandIndex={editingBandIndex}
          editingField={editingField}
          editValue={editValue}
          onFieldEdit={onFieldEdit}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          onRemove={onRemove}
        />
      ))}
      
      <button
        onClick={onAdd}
        className="flex items-center justify-center w-full mt-1 p-1.5 border border-dashed border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
      >
        <Plus className="h-3 w-3 mr-1" />
        <span className="text-xs">Add Band</span>
      </button>
    </div>
  );
});

RrpBands.displayName = 'RrpBands';
