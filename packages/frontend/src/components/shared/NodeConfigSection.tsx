import { ChainConfig } from '../../config/chainConfig';
import SectionHeader from '../SectionHeader';
import DynamicField, { getNestedValue } from './DynamicField';

interface NodeConfigSectionProps {
  config: any;
  onChange: (path: string, value: any) => void;
  chainConfig: ChainConfig;
}

export default function NodeConfigSection({ config, onChange, chainConfig }: NodeConfigSectionProps) {
  // Group fields by section
  const nodeFields = chainConfig.nodeConfigFields.filter(f => f.section === 'node' || !f.section);
  const txpoolFields = chainConfig.nodeConfigFields.filter(f => f.section === 'txpool');

  // Determine grid class based on field configuration
  const getGridClass = (gridColumns?: number) => {
    switch (gridColumns) {
      case 1: return 'form-grid one-column';
      case 2: return 'form-grid two-columns';
      case 3: return 'form-grid three-columns';
      case 4: return 'form-grid four-columns';
      default: return 'form-grid two-columns';
    }
  };

  // Group consecutive fields with same gridColumns value
  const groupFieldsByGrid = (fields: typeof nodeFields) => {
    const groups: Array<{ gridColumns: number; fields: typeof nodeFields }> = [];
    let currentGroup: typeof nodeFields = [];
    let currentGridColumns = fields[0]?.gridColumns || 2;

    fields.forEach((field, index) => {
      const fieldGrid = field.gridColumns || 2;

      if (fieldGrid === currentGridColumns) {
        currentGroup.push(field);
      } else {
        if (currentGroup.length > 0) {
          groups.push({ gridColumns: currentGridColumns, fields: currentGroup });
        }
        currentGroup = [field];
        currentGridColumns = fieldGrid;
      }

      // Push last group
      if (index === fields.length - 1 && currentGroup.length > 0) {
        groups.push({ gridColumns: currentGridColumns, fields: currentGroup });
      }
    });

    return groups;
  };

  const nodeFieldGroups = groupFieldsByGrid(nodeFields);

  return (
    <div className="config-section">
      <SectionHeader
        title="Node Configuration"
        tooltip={chainConfig.tooltips.nodeConfig}
      />

      {/* Render node fields in groups */}
      {nodeFieldGroups.map((group, groupIndex) => (
        <div key={groupIndex} className={getGridClass(group.gridColumns)}>
          {group.fields.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={getNestedValue(config, field.key)}
              onChange={(value) => onChange(field.key, value)}
            />
          ))}
        </div>
      ))}

      {/* Transaction Pool section (only for chains that have it, like BSC) */}
      {txpoolFields.length > 0 && (
        <>
          <h3>Transaction Pool</h3>
          <div className="form-grid two-columns">
            {txpoolFields.map((field) => (
              <DynamicField
                key={field.key}
                field={field}
                value={getNestedValue(config, field.key)}
                onChange={(value) => onChange(field.key, value)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
