
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';

interface FileUploadInputProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const FileUploadInput = ({ onFileSelect, disabled }: FileUploadInputProps) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileSelect(file);
      setSelectedFileName(file.name);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input 
        type="file" 
        id="file-upload"
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
        accept=".json"
      />
      <Button 
        variant="outline" 
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={disabled}
        className="w-full"
      >
        {selectedFileName ? `Selected: ${selectedFileName}` : 'Select File'}
      </Button>
    </div>
  );
};

export default FileUploadInput;
