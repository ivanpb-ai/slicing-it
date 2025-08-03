import React from "react";
import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeProps } from "@xyflow/react";
import { NodeData, NodeType } from "../../types/nodeTypes";
import { useRrpPlmn } from "../../hooks/node/useRrpPlmn";
import { useRrpName } from "../../hooks/node/useRrpName";
import { useRrpBands } from "../../hooks/node/useRrpBands";
import { RrpBands } from "./rrp/RrpBands";
import { RrpNameField } from "./rrp/RrpNameField";
import { RrpPlmnField } from "./rrp/RrpPlmnField";
import { useNodeEditorContext } from "../../contexts/NodeEditorContext";




/**
 * RrpNode component
 * - Editable rrpName (click div â†’ input)
 * - Editable PLMN (add RRPmember, input behaves the same)
 * - Connection handles on top/bottom
 * - Callbacks for persisting rrpName upward
 */

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
export const RrpNode: React.FC<NodeProps<NodeData>> = ({ id, data }) => {
  // ---- Name Editing ----
  // Parent callback to persist rrpName change
  const handlePersistRrpName = React.useCallback(
    (newName: string) => {
      // TODO: Call upstream function (e.g. onNodeDataChange) to persist new rrpName
      // Example (if using context or passed update method):
      // updateNodeData(id, { ...data, rrpName: newName });
      // For now, log:
      console.log(`Persist RRP name for node ${id}:`, newName);
    },
    [id, data]
  );

  const {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick,
  } = useRrpName(data, handlePersistRrpName);


  const {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick,
  } = useRrpPlmn(data);

  // ---- Render Node ----
  return (
    <div
      className="bg-white border-2 border-blue-500 rounded-xl shadow-md px-4 py-2 flex flex-col gap-1 items-center min-w-[180px] relative"
      style={{ minHeight: 80, minWidth: 180 }}
    >
      {/* Handle at Top (target) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !z-50"
        style={{ top: -8 }}
      />

      {/* Header */}
      <div className="w-full bg-green-100 border-b border-green-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-green-800 text-center">RRP#{data.rrpId}</div>
      </div>

      {/* RRP Name (editable) */}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleNameClick();
            }}
            title="Click to edit RRP name"
          >
            {rrpName || "Click to set RRP name"}
          </span>
        )}
      </div>

      {/* PLMN (editable/addable) */}
      <div className="w-full flex items-center gap-1">
        <span className="text-xs text-gray-500">PLMN</span>
        {isEditingPLMN ? (
          <input
            className="w-24 px-1 py-0.5 border rounded"
            value={plmn}
            onChange={handlePLMNChange}
            onBlur={handlePLMNBlur}
            autoFocus
            maxLength={12}
            placeholder="Enter PLMN"
          />
        ) : (
          <span
            tabIndex={0}
            className="ml-1 cursor-pointer outline-none hover:underline focus:ring text-blue-600 text-xs"
            onClick={handlePLMNClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePLMNClick();
            }}
            title="Click to add PLMN and create RRP member"
          >
            {plmn ? plmn : "Add PLMN (creates RRPmember)"}
          </span>
        )}
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

      {/* Handle at Bottom (source) */}
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
};

export default RrpNode;