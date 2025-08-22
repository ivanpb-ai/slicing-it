
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

type MenuButtonProps = {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  className?: string;
};

const MenuButton: React.FC<MenuButtonProps> = ({
  icon: Icon,
  onClick,
  title,
  className = ''
}) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClick}
      title={title}
      className={`p-2 bg-white hover:bg-gray-100 shadow-md ${className}`}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
};

export default MenuButton;
