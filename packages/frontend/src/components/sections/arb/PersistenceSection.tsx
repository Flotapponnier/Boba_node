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
      case 'full':
        return 'Disk space for full node L2 data. 2Ti minimum (Arb One: ~560GB + 200GB/month growth). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.';
      case 'archive':
        return 'Disk space for archive node L2 data. 12Ti+ required (Arb One: ~9.7TB + 850GB/month growth). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.';
      case 'validator':
        return 'Disk space for validator node data. 2Ti minimum recommended for L2 state and L1 monitoring. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.';
      default:
        return 'Disk space for blockchain data.';
    }
  };

  return (
    <div className="config-section">
      <SectionHeader
        title="Storage"
        tooltip="Persistent storage for Arbitrum blockchain data. NVMe SSDs strongly recommended due to high I/O requirements. Arbitrum One: 560GB pruned (grows 200GB/month), Nova: 400GB pruned (grows 1.6TB/month). Archive nodes need significantly more."
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
              <HelpTooltip content="Kubernetes StorageClass name for provisioning. Examples: local-path, gp3, premium-ssd. NVMe SSD required for Arbitrum due to high I/O demands." />
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
