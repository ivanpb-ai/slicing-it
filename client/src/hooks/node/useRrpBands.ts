
import { useState, useCallback } from "react";
import { NodeData, RrpBand } from "../../types/nodeTypes";
import { useNodeEditorContext } from "../../contexts/NodeEditorContext";

export const useRrpBands = (data: NodeData) => {
  const { updateNodeData } = useNodeEditorContext();
  const [rrpBands, setRrpBands] = useState<RrpBand[]>(data.rrpBands || []);
  const [editingBandIndex, setEditingBandIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'dl' | 'ul' | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddBand = useCallback(() => {
    const newBand: RrpBand = { name: '', dl: 50, ul: 50 };
    const newBands = [...rrpBands, newBand];
    setRrpBands(newBands);
    updateNodeData(data.nodeId, { ...data, rrpBands: newBands });
    setEditingBandIndex(newBands.length - 1);
    setEditingField('name');
    setEditValue('');
  }, [rrpBands, data, updateNodeData]);

  const handleBandFieldEdit = useCallback((index: number, field: 'name' | 'dl' | 'ul') => {
    setEditingBandIndex(index);
    setEditingField(field);
    setEditValue(rrpBands[index][field].toString());
  }, [rrpBands]);

  const handleBandFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleBandFieldBlur = useCallback(() => {
    if (editingBandIndex !== null && editingField) {
      const newBands = [...rrpBands];
      if (editingField === 'name') {
        newBands[editingBandIndex].name = editValue;
      } else {
        const numValue = parseInt(editValue, 10);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
          newBands[editingBandIndex][editingField] = numValue;
        }
      }
      setRrpBands(newBands);
      updateNodeData(data.nodeId, { ...data, rrpBands: newBands });
    }
    setEditingBandIndex(null);
    setEditingField(null);
  }, [editingBandIndex, editingField, editValue, rrpBands, data, updateNodeData]);

  const handleRemoveBand = useCallback((index: number) => {
    const newBands = rrpBands.filter((_, i) => i !== index);
    setRrpBands(newBands);
    updateNodeData(data.nodeId, { ...data, rrpBands: newBands });
    setEditingBandIndex(null);
    setEditingField(null);
  }, [rrpBands, data, updateNodeData]);

  return {
    rrpBands,
    editingBandIndex,
    editingField,
    editValue,
    handleAddBand,
    handleBandFieldEdit,
    handleBandFieldChange,
    handleBandFieldBlur,
    handleRemoveBand
  };
};
