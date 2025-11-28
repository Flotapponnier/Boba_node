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
      case 'light':
        return 'CPU cores reserved for light node. Use whole numbers (2) or millicores (2000m). Light nodes: 2-4 cores for header-only sync.';
      case 'full':
        return 'CPU cores reserved for full node. Use whole numbers (8) or millicores (8000m). Full nodes: 8-16 cores recommended for snap sync and validation.';
      case 'archive':
        return 'CPU cores reserved for archive node. Use whole numbers (16) or millicores (16000m). Archive nodes: 16-32 cores required for historical state queries.';
      case 'validator':
        return 'CPU cores reserved for validator node. Use whole numbers (8) or millicores (8000m). Validators: 8+ cores for block proposals and attestations.';
      default:
        return 'CPU cores reserved for the node.';
    }
  };

  // Get context-aware memory tooltip based on node type
  const getMemoryTooltip = () => {
    switch (nodeType) {
      case 'light':
        return 'RAM reserved for light node. Use Gi (gibibytes) or Mi (mebibytes). Light nodes: 4-8Gi for minimal resource usage.';
      case 'full':
        return 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 16-32Gi for snap sync and recent state.';
      case 'archive':
        return 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 64Gi+ for complete historical state.';
      case 'validator':
        return 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 32Gi+ for consensus participation.';
      default:
        return 'RAM reserved for the node.';
    }
  };

  return (
    <div className="config-section">
      <SectionHeader
        title="Resources"
        tooltip="Kubernetes resource allocation for your Ethereum node. Requests guarantee minimum resources. For Ethereum mainnet: Light nodes need 2-4 cores and 4-8GB RAM, Full nodes require 8-16 cores and 16-32GB RAM, Archive nodes need 16-32 cores and 64GB+ RAM."
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
            placeholder="e.g., 8, 8000m"
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
