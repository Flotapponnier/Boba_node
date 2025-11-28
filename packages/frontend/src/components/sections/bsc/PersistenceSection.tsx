import HelpTooltip from '../../HelpTooltip';
import SectionHeader from '../../SectionHeader';

interface PersistenceSectionProps {
  persistence: {
    enabled: boolean;
    storageClass: string;
    size: string;
    hostPath?: string;
  };
  nodeType: string;
  onChange: (path: string, value: any) => void;
}

export default function PersistenceSection({ persistence, nodeType, onChange }: PersistenceSectionProps) {
  // Get context-aware storage tooltip based on node type
  const getStorageTooltip = () => {
    switch (nodeType) {
      case 'fast':
        return 'Disk space for fast node blockchain data. 3Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.';
      case 'full':
        return 'Disk space for full node blockchain data. 3Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.';
      case 'archive':
        return 'Disk space for archive node blockchain data. 10Ti+ required for complete historical state. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.';
      case 'validator':
        return 'Disk space for validator node blockchain data. 3Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory for validators.';
      default:
        return 'Disk space for blockchain data.';
    }
  };

  return (
    <div className="config-section">
      <SectionHeader
        title="Storage Persistence"
        tooltip="Persistent storage configuration using PersistentVolumeClaims (PVC). Critical for production deployments - enables data survival across pod restarts. NVMe SSDs are strongly recommended for blockchain data due to high I/O requirements. BSC mainnet requires 3TB+ for full nodes, 10TB+ for archive nodes."
      />
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={persistence.enabled}
            onChange={(e) => onChange('persistence.enabled', e.target.checked)}
          />
          <span>
            Enable Persistence (PVC)
            <HelpTooltip content="Creates a PersistentVolumeClaim to store blockchain data. Essential for production - without this, data is lost on pod restart." />
          </span>
        </label>
      </div>
      {persistence.enabled && (
        <div className="form-grid two-columns">
          <div className="form-group">
            <label>
              Storage Class
              <HelpTooltip content="Kubernetes StorageClass name for provisioning. Examples: local-path, gp3, premium-ssd. Must support the required disk size." />
            </label>
            <input
              type="text"
              value={persistence.storageClass}
              onChange={(e) => onChange('persistence.storageClass', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Size
              <HelpTooltip content={getStorageTooltip()} />
            </label>
            <input
              type="text"
              value={persistence.size}
              onChange={(e) => onChange('persistence.size', e.target.value)}
              placeholder="e.g., 3Ti, 3072Gi"
            />
          </div>
        </div>
      )}
    </div>
  );
}
