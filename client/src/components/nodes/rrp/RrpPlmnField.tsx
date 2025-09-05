
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
        className="text-base p-3 w-full border border-gray-300 rounded text-center mt-1"
        autoFocus
      />
    );
  }

  return (
    <div 
      className="flex items-center justify-center cursor-pointer hover:bg-gray-100/50 text-base p-3 rounded mt-1 border border-transparent"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {value ? `${label}: ${value}` : placeholder}
    </div>
  );
});

RrpPlmnField.displayName = 'RrpPlmnField';
