import React, { useRef, useState } from 'react';

interface FileImportInputProps {
  onImport: (file: File) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FileImportInput: React.FC<FileImportInputProps> = ({ onImport, inputRef }) => {
  // Internal ref if no external ref is passed
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef || internalFileInputRef;

  // Use a key to force remount of the input to reset it completely
  const [inputKey, setInputKey] = useState(Date.now());

  const handleImportGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('FileImportInput: No files selected');
      return;
    }

    const file = files[0];
    console.log(
      `FileImportInput: Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`
    );

    // Validate file type (accept JSON files)
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      console.error('FileImportInput: Invalid file type:', file.type);
      // Force remount so the user can try again
      setInputKey(Date.now());
      return;
    }

    try {
      onImport(file);
      console.log('FileImportInput: Successfully called onImport handler');
    } catch (error) {
      console.error('FileImportInput: Error calling onImport:', error);
    }

    // Force remount so the same file can be selected again
    setInputKey(Date.now());
  };

  return (
    <input
      key={inputKey}
      ref={fileInputRef}
      type="file"
      accept=".json,application/json"
      aria-label="Import graph file"
      onChange={handleImportGraph}
    />
  );
};

export default FileImportInput;
