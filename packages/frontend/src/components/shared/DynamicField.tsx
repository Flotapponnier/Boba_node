import { FieldDefinition } from '../../config/chainConfig';
import HelpTooltip from '../HelpTooltip';

interface DynamicFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
}

// Helper to get nested value from object using dot notation
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper to set nested value in object using dot notation
export function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  return newObj;
}

export default function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const renderInput = () => {
    switch (field.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value ?? field.default ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={value ?? field.default ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <select
            value={value ?? field.default ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value ?? field.default ?? false}
            onChange={(e) => onChange(e.target.checked)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="form-group">
      <label>
        {field.label}
        {field.tooltip && <HelpTooltip content={field.tooltip} />}
      </label>
      {renderInput()}
    </div>
  );
}
