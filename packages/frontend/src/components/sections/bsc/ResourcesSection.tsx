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
      case 'fast':
        return 'CPU cores reserved for fast node. Use whole numbers (16) or millicores (16000m). Fast nodes: 16 cores recommended for high-performance RPC.';
      case 'full':
        return 'CPU cores reserved for full node. Use whole numbers (16) or millicores (16000m). Full nodes: 16 cores for complete validation.';
      case 'archive':
        return 'CPU cores reserved for archive node. Use whole numbers (32) or millicores (32000m). Archive nodes: 32+ cores required for historical state queries.';
      case 'validator':
        return 'CPU cores reserved for validator node. Use whole numbers (16) or millicores (16000m). Validators: 16+ cores for block production and consensus.';
      default:
        return 'CPU cores reserved for the node.';
    }
  };

  // Get context-aware memory tooltip based on node type
  const getMemoryTooltip = () => {
    switch (nodeType) {
      case 'fast':
        return 'RAM reserved for fast node. Use Gi (gibibytes) or Mi (mebibytes). Fast nodes: 32-64Gi for high-performance operation.';
      case 'full':
        return 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 64Gi for complete validation.';
      case 'archive':
        return 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 128Gi+ for historical state storage.';
      case 'validator':
        return 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 64Gi+ for reliable block production.';
      default:
        return 'RAM reserved for the node.';
    }
  };

  return (
    <div className="config-section">
      <SectionHeader
        title="Resource Requirements"
        tooltip="Kubernetes resource requests defining the minimum CPU and memory allocated to your node. These values ensure your node has guaranteed resources. For production: Fast nodes need 8-16 cores and 32-64GB RAM, Archive nodes require 32+ cores and 128GB+ RAM."
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
            placeholder="e.g., 16, 16000m"
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
            placeholder="e.g., 64Gi, 65536Mi"
          />
        </div>
      </div>
    </div>
  );
}
