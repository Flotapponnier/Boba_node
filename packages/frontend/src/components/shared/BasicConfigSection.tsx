import { ChainConfig, FieldDefinition } from '../../config/chainConfig';
import HelpTooltip from '../HelpTooltip';
import SectionHeader from '../SectionHeader';
import DynamicField, { getNestedValue } from './DynamicField';

interface BasicConfigSectionProps {
  config: any;
  onChange: (path: string, value: any) => void;
  chainConfig: ChainConfig;
}

export default function BasicConfigSection({ config, onChange, chainConfig }: BasicConfigSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Basic Configuration"
        tooltip={chainConfig.tooltips.basicConfig}
      />
      <div className="form-grid two-columns">
        {/* Common fields for all chains */}
        <div className="form-group">
          <label>
            Deployment Name *
            <HelpTooltip content="Unique identifier for this deployment. Used in Helm chart naming and Kubernetes resources. Must be lowercase alphanumeric with hyphens only." />
          </label>
          <input
            type="text"
            value={config?.deploymentName || ''}
            onChange={(e) => onChange('deploymentName', e.target.value)}
            placeholder="production-mainnet"
            required
          />
        </div>

        <div className="form-group">
          <label>
            Node Name
            <HelpTooltip content={`Human-readable name for your ${chainConfig.fullName} node. Used in labels and service discovery.`} />
          </label>
          <input
            type="text"
            value={config?.nodeName || ''}
            onChange={(e) => onChange('nodeName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Namespace
            <HelpTooltip content="Kubernetes namespace for deployment. Namespaces help organize resources in your cluster." />
          </label>
          <input
            type="text"
            value={config?.namespace || ''}
            onChange={(e) => onChange('namespace', e.target.value)}
          />
        </div>

        {/* Chain-specific basic fields (e.g., networkId for ETH, chainName for ARB) */}
        {chainConfig.basicConfigFields?.map((field: FieldDefinition) => (
          <DynamicField
            key={field.key}
            field={field}
            value={getNestedValue(config, field.key)}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </div>
  );
}
