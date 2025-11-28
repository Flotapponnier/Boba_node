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
        tooltip="Pre-synced blockchain snapshot for faster initial synchronization. Reduces sync time from weeks to hours/days. Ethereum mainnet snapshots are 600GB+ compressed. Ensure sufficient bandwidth and temporary storage for download and extraction."
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
                  url: '',
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
            <HelpTooltip content="URL to download blockchain snapshot. Use trusted sources only. Snapshots are large (600GB+ compressed) and reduce initial sync time significantly." />
          </label>
          <input
            type="text"
            value={snapshot.url || ''}
            onChange={(e) => onChange('snapshot.url', e.target.value)}
            placeholder="https://example.com/eth-snapshot.tar.gz"
          />
        </div>
      )}
    </div>
  );
}
