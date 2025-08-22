
import { memo } from "react";

interface RrpNameFieldProps {
  isEditing: boolean;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onClick: () => void;
}

export const RrpNameField = memo(({
  isEditing,
  name,
  onChange,
  onBlur,
  onClick
}: RrpNameFieldProps) => {
  if (isEditing) {
    return (
      <input
        type="text"
        value={name}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Enter RRP name..."
        className="text-sm font-semibold p-1 w-full border border-gray-300 rounded text-center mb-1"
        autoFocus
      />
    );
  }

  return (
    <div 
      className="text-sm font-semibold cursor-pointer hover:bg-gray-100/50 p-1 rounded text-center mb-1"
      onClick={onClick}
    >
      {name}
    </div>
  );
});

RrpNameField.displayName = 'RrpNameField';
