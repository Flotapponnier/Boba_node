import HelpTooltip from '../../HelpTooltip';
import SectionHeader from '../../SectionHeader';

interface ResourcesSectionProps {
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits?: {
      cpu?: string;
      memory?: string;
    };
  };
  nodeType: string;
  onChange: (path: string, value: any) => void;
}

export default function ResourcesSection({ resources, nodeType, onChange }: ResourcesSectionProps) {
  // Get context-aware CPU tooltip based on node type
  const getCpuTooltip = () => {
    switch (nodeType) {
      case 'full':
        return 'CPU cores reserved for full node. Use whole numbers (4) or millicores (4000m). Full nodes: 4-core minimum, single-core performance matters for Nitro.';
      case 'archive':
        return 'CPU cores reserved for archive node. Use whole numbers (4) or millicores (4000m). Archive nodes: 4-core minimum, high single-core performance for historical queries.';
      case 'validator':
        return 'CPU cores reserved for validator node. Use whole numbers (4) or millicores (4000m). Validators: 4-core minimum for state verification and L1 monitoring.';
      default:
        return 'CPU cores reserved for the node.';
    }
  };

  // Get context-aware memory tooltip based on node type
  const getMemoryTooltip = () => {
    switch (nodeType) {
      case 'full':
        return 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 16Gi minimum for pruned L2 state and watchtower mode.';
      case 'archive':
        return 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 16Gi+ for complete historical L2 state.';
      case 'validator':
        return 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 16Gi+ for state verification and assertion posting.';
      default:
        return 'RAM reserved for the node.';
    }
  };

  return (
    <div className="config-section">
      <SectionHeader
        title="Resources"
        tooltip="Kubernetes resource allocation for Arbitrum Nitro node. Minimum requirements: 4-core CPU (single-core performance matters), 16GB RAM. Full nodes need 2TB storage, Archive nodes require 12TB+ for Arbitrum One. Storage grows ~850GB/month for Arb One."
      />
      <div className="form-grid two-columns">
        <div className="form-group">
          <label>
            CPU Requests
            <HelpTooltip content={getCpuTooltip()} />
          </label>
          <input
            type="text"
            value={resources.requests.cpu}
            onChange={(e) => onChange('resources.requests.cpu', e.target.value)}
            placeholder="e.g., 4, 4000m"
          />
        </div>
        <div className="form-group">
          <label>
            Memory Requests
            <HelpTooltip content={getMemoryTooltip()} />
          </label>
          <input
            type="text"
            value={resources.requests.memory}
            onChange={(e) => onChange('resources.requests.memory', e.target.value)}
            placeholder="e.g., 16Gi, 16384Mi"
          />
        </div>
      </div>
    </div>
  );
}
