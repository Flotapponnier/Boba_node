import HelpTooltip from '../../HelpTooltip';
import SectionHeader from '../../SectionHeader';

interface SnapshotSectionProps {
  snapshot?: {
    enabled: boolean;
    url?: string;
    checksum?: string;
  };
  onChange: (path: string, value: any) => void;
}

export default function SnapshotSection({ snapshot, onChange }: SnapshotSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Snapshot Download"
        tooltip="Enables downloading a pre-synced blockchain snapshot for faster initial synchronization. Highly recommended for new nodes to reduce sync time from days/weeks to hours. Snapshots are large files (1TB+) so ensure adequate bandwidth and storage."
      />
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={snapshot?.enabled || false}
            onChange={(e) => {
              if (e.target.checked) {
                onChange('snapshot', {
                  enabled: true,
                  url: 'https://tf-dex-prod-public-snapshot.s3-accelerate.amazonaws.com/geth-latest.tar.gz',
                });
              } else {
                onChange('snapshot', { enabled: false });
              }
            }}
          />
          Enable snapshot download for faster initial sync
        </label>
      </div>
      {snapshot?.enabled && (
        <div className="form-group">
          <label>
            Snapshot URL
            <HelpTooltip content="URL to download blockchain snapshot. Official snapshots available from BNB Chain. Verify checksum before use." />
          </label>
          <input
            type="text"
            value={snapshot.url || ''}
            onChange={(e) => onChange('snapshot.url', e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}
