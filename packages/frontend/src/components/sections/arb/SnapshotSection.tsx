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
        tooltip="Pre-synced Arbitrum blockchain snapshot for faster node initialization. Note: As of May 2024, official snapshot service discontinued due to rapid state growth. Community snapshots may be available. Verify checksum if provided."
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
            <HelpTooltip content="URL to L2 snapshot download. Note: Official snapshot service discontinued May 2024. Community snapshots may be available, verify checksums." />
          </label>
          <input
            type="text"
            value={snapshot.url || ''}
            onChange={(e) => onChange('snapshot.url', e.target.value)}
            placeholder="https://snapshot.arbitrum.foundation/arb1/nitro-pruned.tar"
          />
        </div>
      )}
    </div>
  );
}
