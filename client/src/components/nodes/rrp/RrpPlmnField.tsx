
import { memo } from "react";

interface RrpPlmnFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClick: () => void;
  placeholder: string;
}

export const RrpPlmnField = memo(({
  label,
  value,
  isEditing,
  onChange,
  onBlur,
  onClick,
  placeholder
}: RrpPlmnFieldProps) => {
  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="text-xs p-1 w-full border border-gray-300 rounded text-center mt-1"
        autoFocus
      />
    );
  }

  return (
    <div 
      className="flex items-center justify-center cursor-pointer hover:bg-gray-100/50 p-1 rounded mt-1 bg-yellow-100 border border-orange-300"
      onClick={(e) => {
        console.log('RrpPlmnField: Click detected!', { value, isEditing });
        e.stopPropagation();
        onClick();
      }}
    >
      {value ? `${label}: ${value}` : placeholder}
    </div>
  );
});

RrpPlmnField.displayName = 'RrpPlmnField';
