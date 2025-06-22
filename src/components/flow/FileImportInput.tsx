import React, { useState } from 'react';

interface FileImportInputProps {
  onImport: (file: File) => void;
}

const FileImportInput: React.FC<FileImportInputProps> = ({ onImport }) => {
  // Use a key to force remount of the input
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

    // Validate file type
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
      type="file"
      accept=".json,application/json"
      onChange={handleImportGraph}
    />
  );
};

export default FileImportInput;
