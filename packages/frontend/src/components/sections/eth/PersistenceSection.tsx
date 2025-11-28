import HelpTooltip from '../../HelpTooltip';
import SectionHeader from '../../SectionHeader';

interface PersistenceSectionProps {
  persistence: {
    enabled: boolean;
    storageClass: string;
    size: string;
  };
  nodeType: string;
  onChange: (path: string, value: any) => void;
}

export default function PersistenceSection({ persistence, nodeType, onChange }: PersistenceSectionProps) {
  // Get context-aware storage tooltip based on node type
  const getStorageTooltip = () => {
    switch (nodeType) {
      case 'light':
        return 'Disk space for light node data. 100Gi minimum for headers. Use Ti (tebibytes) or Gi (gibibytes). SSD recommended.';
      case 'full':
        return 'Disk space for full node blockchain data. 2Ti minimum (grows ~14GB/week). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.';
      case 'archive':
        return 'Disk space for archive node blockchain data. 12-20Ti+ required for complete history. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.';
      case 'validator':
        return 'Disk space for validator node data. 2Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory for validators.';
      default:
        return 'Disk space for blockchain data.';
    }
  };

  return (
    <div className="config-section">
      <SectionHeader
        title="Storage"
        tooltip="Persistent volume configuration for blockchain data. Essential for production - ensures data persists across pod restarts. Ethereum mainnet requires fast SSD storage: Full nodes need 2TB minimum, Archive nodes require 12-20TB+. Database grows ~14GB per week."
      />
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={persistence.enabled}
            onChange={(e) => onChange('persistence.enabled', e.target.checked)}
          />
          <span>
            Enable Persistent Volume
            <HelpTooltip content="Creates a PersistentVolumeClaim to store blockchain data. Essential for production - without this, data is lost on pod restart." />
          </span>
        </label>
      </div>
      {persistence.enabled && (
        <div className="form-grid two-columns">
          <div className="form-group">
            <label>
              Storage Class
              <HelpTooltip content="Kubernetes StorageClass name for provisioning. Examples: local-path, gp3, premium-ssd. Must support the required disk size and IOPS." />
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
              placeholder="e.g., 2Ti, 2048Gi"
            />
          </div>
        </div>
      )}
    </div>
  );
}
