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
    
    // 1. Guard against undefined files
    if (!files || files.length === 0) {
      console.log('FileImportInput: No files selected');
      return;
    }

    // 2. Safely access file
    const file = files[0];
    console.log(`FileImportInput: Processing file: ${file.name}`);

    // 3. Reset input AFTER processing
    event.target.value = '';

    // 4. Validate and process
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      console.error('Invalid file type:', file.type);
      return;
    }

    onImport(file); // Pass to parent
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
