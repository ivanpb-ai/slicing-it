import React, { useRef } from 'react';

interface FileImportInputProps {
  onImport: (file: File) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FileImportInput: React.FC<FileImportInputProps> = ({ onImport, inputRef }) => {
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef || internalFileInputRef;

  const handleImportGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      console.error('FileImportInput: Invalid file type:', file.type);
      event.target.value = '';
      return;
    }

    try {
      onImport(file);
    } catch (error) {
      console.error('FileImportInput: Error calling onImport:', error);
    }

    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json,application/json"
      aria-label="Import graph file"
      onChange={handleImportGraph}
    />
  );
};

export default FileImportInput;
