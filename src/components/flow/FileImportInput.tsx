
import React, { useRef, useEffect } from 'react';

interface FileImportInputProps {
  onImport: (file: File) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FileImportInput: React.FC<FileImportInputProps> = ({ onImport, inputRef }) => {
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef || internalFileInputRef;

  // Handle file selection and import - simplified logic
const handleImportGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  onImport(files[0]);
  // Reset so the same file can be selected again
  event.target.value = '';


    const file = files[0];
    console.log(`FileImportInput: Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
    
    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      console.error('FileImportInput: Invalid file type:', file.type);
      return;
    }
    
    try {
      // Call the import handler directly
      onImport(file);
      console.log('FileImportInput: Successfully called onImport handler');
    } catch (error) {
      console.error('FileImportInput: Error calling onImport:', error);
    }
  };
  
  return (
    <input 
      type="file" 
      ref={fileInputRef}
      onChange={handleImportGraph}
      accept=".json,application/json"
      className="hidden"
      aria-label="Import graph file"
      onClick={(e) => {
        // CRITICAL FIX: Force complete reset of the input
        const target = e.target as HTMLInputElement;
        target.value = '';
        target.files = null;
        console.log('FileImportInput: Force reset input before dialog');
        
        // Add a small delay to ensure reset takes effect
        setTimeout(() => {
          console.log('FileImportInput: Input reset completed');
        }, 10);
      }}
    />
  );
};

export default FileImportInput;