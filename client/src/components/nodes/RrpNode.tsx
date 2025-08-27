import React, { memo, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { NodeData } from "../../types/nodeTypes";
import { useRrpPlmn } from "../../hooks/node/useRrpPlmn";
import { useRrpName } from "../../hooks/node/useRrpName";
import { useRrpBands } from "../../hooks/node/useRrpBands";
import { RrpBands } from "./rrp/RrpBands";
import { useNodeEditorContext } from "../../contexts/NodeEditorContext";
import { RrpPlmnField } from "./rrp/RrpPlmnField";

interface RrpNodeProps {
  id: string;
  data: NodeData;
}

export const RrpNode = memo(({ id, data }: RrpNodeProps) => {

  const { createChildNode, updateNodeData } = useNodeEditorContext();

  // Bands management
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

  // Name editing, propagates via updateNodeData
  const handlePersistRrpName = useCallback(
    (newName: string) => {
      updateNodeData(id, { ...data, rrpName: newName });
    },
    [id, data, updateNodeData]
  );

  const {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick,
  } = useRrpName(data, handlePersistRrpName);

  // PLMN editing/member creation
  const {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick
  } = useRrpPlmn(data, createChildNode);

  return (
    <div
      className="bg-white border-2 border-blue-500 rounded-xl shadow-md px-4 py-2 flex flex-col gap-1 items-center min-w-[180px] relative"
      style={{ minHeight: 80, minWidth: 180 }}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !z-50"
        style={{ top: -8 }}
      />

      {/* Header */}
      <div className="w-full bg-green-100 border-b border-green-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-green-800 text-center">
          RRP#{data.rrpId}
        </div>
      </div>

      {/* RRP Name */}
      <div className="w-full text-center text-lg mb-2">
        {isEditingName ? (
          <input
            className="w-full px-1 py-0.5 border rounded"
            value={rrpName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            autoFocus
            maxLength={48}
            placeholder="Enter RRP name"
          />
        ) : (
          <span
            tabIndex={0}
            className="cursor-pointer outline-none focus:ring"
            onClick={handleNameClick}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleNameClick();
            }}
            title="Click to edit RRP name"
          >
            {rrpName || "Click to set RRP name"}
          </span>
        )}
      </div>

      {/* PLMN Field */}
      <div className="w-full text-center mb-2 border-2 border-blue-300 p-1">
        <div className="text-xs text-gray-500 mb-1">PLMN Field Debug:</div>
        <RrpPlmnField
          label="PLMN"
          value={plmn}
          isEditing={isEditingPLMN}
          onChange={handlePLMNChange}
          onBlur={handlePLMNBlur}
          onClick={handlePLMNClick}
          placeholder="Add PLMN (creates RRPmember)"
        />
      </div>

      {/* RrpBands: pass all props */}
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

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !z-50"
        style={{ bottom: -8 }}
        isConnectable={true}
      />
    </div>
  );
});

export default RrpNode;
