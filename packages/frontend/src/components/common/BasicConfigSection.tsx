import HelpTooltip from '../HelpTooltip';
import SectionHeader from '../SectionHeader';

interface BasicConfigSectionProps {
  deploymentName: string;
  nodeName: string;
  namespace: string;
  onDeploymentNameChange: (value: string) => void;
  onNodeNameChange: (value: string) => void;
  onNamespaceChange: (value: string) => void;
  chainName?: string;
  additionalFields?: React.ReactNode;
}

export default function BasicConfigSection({
  deploymentName,
  nodeName,
  namespace,
  onDeploymentNameChange,
  onNodeNameChange,
  onNamespaceChange,
  additionalFields,
}: BasicConfigSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Basic Configuration"
        tooltip="Core identifiers for your node deployment. These settings define how your node is named and organized within your Kubernetes cluster infrastructure."
      />
      <div className="form-grid two-columns">
        <div className="form-group">
          <label>
            Deployment Name *
            <HelpTooltip content="Unique identifier for this deployment. Used in Helm chart naming and Kubernetes resources. Must be lowercase alphanumeric with hyphens only." />
          </label>
          <input
            type="text"
            value={deploymentName}
            onChange={(e) => onDeploymentNameChange(e.target.value)}
            placeholder="production-mainnet"
            required
          />
        </div>
        <div className="form-group">
          <label>
            Node Name
            <HelpTooltip content="Human-readable name for your node. Used in labels and service discovery." />
          </label>
          <input
            type="text"
            value={nodeName}
            onChange={(e) => onNodeNameChange(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            Namespace
            <HelpTooltip content="Kubernetes namespace for deployment. Namespaces help organize resources in your cluster." />
          </label>
          <input
            type="text"
            value={namespace}
            onChange={(e) => onNamespaceChange(e.target.value)}
          />
        </div>
        {additionalFields}
      </div>
    </div>
  );
}
