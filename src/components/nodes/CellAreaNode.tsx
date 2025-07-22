
import { useState, useEffect, useCallback, memo } from "react";
import { NodeData } from "../../types/nodeTypes";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Handle, Position } from "@xyflow/react";


interface CellAreaNodeProps {
  data: NodeData;
}

const CellAreaNode = memo(({ data }: CellAreaNodeProps) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [cellDescription, setCellDescription] = useState(
    data.cellAreaDescription || "Cell Area Description"
  );
  const [notes, setNotes] = useState(data.notes || "");

  // Effect to set default description if not provided
  useEffect(() => {
    if (!data.cellAreaDescription) {
      const newDescription = "Cell Area Description";
      setCellDescription(newDescription);
      data.cellAreaDescription = newDescription;
    }
  }, [data]);

  // Ensure visibility and store node ID reference
  useEffect(() => {
    // Store node ID reference
    if (data.nodeId) {
      data.id = data.nodeId;
    }
    
    // Simple visibility check
    const ensureVisibility = () => {
      const nodeElement = document.querySelector(`[data-id="${data.nodeId}"]`);
      if (nodeElement) {
        (nodeElement as HTMLElement).setAttribute('data-type', 'cell-area');
        (nodeElement as HTMLElement).classList.add('cell-area-node');
      }
    };
    
    // Run once immediately
    ensureVisibility();
    
    // And again after a short delay to catch late rendering
    setTimeout(ensureVisibility, 100);
  }, [data.nodeId, data.cellAreaId, data.id]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCellDescription(newValue);
    data.cellAreaDescription = newValue;
  }, [data]);

  const handleDescriptionBlur = useCallback(() => {
    setIsEditingDescription(false);
  }, []);

  const handleDescriptionClick = useCallback(() => {
    setIsEditingDescription(true);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNotes(newValue);
    data.notes = newValue;
  }, [data]);

  // Format the cell area ID properly - ensure it shows a number
  const displayId = data.cellAreaId !== undefined && data.cellAreaId !== null ? data.cellAreaId : 1;

  return (
    
      <div className="w-full h-full flex flex-col items-center relative">

      {/* Input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-orange-500 !opacity-100 !z-50"
        style={{ top: -8 }}
        isConnectable={true}
      />

      {/* Output handle at the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !opacity-100 !z-50"
        style={{ bottom: -8 }}
        isConnectable={true}
      />
    
      <div className="cell-area-content">

      {/* Header - Shows "TAC #" with the cellAreaId */}
      <div className="w-full bg-blue-100 border-b border-blue-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-blue-800 text-center">TAC #{displayId}</div>
      </div>

      {isEditingDescription ? (
        <Input
          type="text"
          value={cellDescription}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          placeholder="Add description..."
          className="text-xs p-1 w-full border border-gray-300 rounded bg-white"
          autoFocus
        />
      ) : (
        <div 
          className="text-xs text-center cursor-pointer hover:bg-blue-100 p-1 rounded cell-area-description"
          onClick={handleDescriptionClick}
        >
          {cellDescription}
        </div>
      )}
      
      <Textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Add notes..."
        className="cell-area-notes"
        rows={2}
      />
    </div>
  </div>
  );
});

export default CellAreaNode;
