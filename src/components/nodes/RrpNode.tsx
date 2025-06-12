
import { memo } from "react";
import { NodeData } from "@/types/nodeTypes";
import { useRrpPlmn } from "@/hooks/node/useRrpPlmn";
import { useRrpBands } from "@/hooks/node/useRrpBands";
import { useRrpName } from "@/hooks/node/useRrpName";
import { useNodeEditorContext } from "@/contexts/NodeEditorContext";
import { RrpNameField } from "./rrp/RrpNameField";
import { RrpPlmnField } from "./rrp/RrpPlmnField";
import { RrpBands } from "./rrp/RrpBands";

interface RrpNodeProps {
  data: NodeData;
}

const RrpNode = memo(({ data }: RrpNodeProps) => {
  const { createChildNode } = useNodeEditorContext();
  
  const {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick
  } = useRrpPlmn(data, createChildNode);

  const {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick
  } = useRrpName(data);

  const {
    rrpBands,
    editingBandIndex,
    editingField,
    editValue,
    handleAddBand,
    handleBandFieldEdit,
    handleBandFieldChange,
    handleBandFieldBlur,
    handleRemoveBand
  } = useRrpBands(data);

  return (
    <div className="text-xs text-gray-600 text-center">
      {/* Header */}
      <div className="w-full bg-green-100 border-b border-green-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-green-800 text-center">RRP</div>
      </div>
      
      {/* RRP Name */}
      <div className="mb-2">
        <RrpNameField
          isEditing={isEditingName}
          name={rrpName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onClick={handleNameClick}
        />
      </div>

      {/* PLMN Field */}
      <div className="mb-2">
        <RrpPlmnField
          label="PLMN"
          value={plmn}
          isEditing={isEditingPLMN}
          onChange={handlePLMNChange}
          onBlur={handlePLMNBlur}
          onClick={handlePLMNClick}
          placeholder="Click to add PLMN..."
        />
      </div>

      {/* Band Fields */}
      <RrpBands
        bands={rrpBands}
        editingBandIndex={editingBandIndex}
        editingField={editingField}
        editValue={editValue}
        onFieldEdit={handleBandFieldEdit}
        onFieldChange={handleBandFieldChange}
        onFieldBlur={handleBandFieldBlur}
        onRemove={handleRemoveBand}
        onAdd={handleAddBand}
      />
      
      {/* Removed the percentage display that was here */}
    </div>
  );
});

export default RrpNode;
