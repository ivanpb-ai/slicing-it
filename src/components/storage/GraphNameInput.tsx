
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface GraphNameInputProps {
  graphName: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const GraphNameInput = ({ graphName, onChange, disabled }: GraphNameInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="graph-name" className="text-sm font-medium">Graph Name</Label>
      <Input 
        id="graph-name"
        placeholder="Enter a name for your graph" 
        value={graphName}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mb-2"
      />
    </div>
  );
};

export default GraphNameInput;
