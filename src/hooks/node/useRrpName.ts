
import { useState, useCallback } from "react";
import { NodeData } from "@/types/nodeTypes";

export const useRrpName = (data: NodeData) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [rrpName, setRrpName] = useState(data.rrpName || 'RRP-1');

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRrpName(e.target.value);
    data.rrpName = e.target.value;
  }, [data]);

  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
  }, []);

  const handleNameClick = useCallback(() => {
    setIsEditingName(true);
  }, []);

  return {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick
  };
};
