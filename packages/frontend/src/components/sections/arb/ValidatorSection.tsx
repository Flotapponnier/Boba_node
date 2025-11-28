import HelpTooltip from '../../HelpTooltip';
import SectionHeader from '../../SectionHeader';

interface ValidatorSectionProps {
  stakerEnable: boolean;
  stakerStrategy?: string;
  onChange: (path: string, value: any) => void;
}

export default function ValidatorSection({ stakerEnable, stakerStrategy, onChange }: ValidatorSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Validator Configuration"
        tooltip="Arbitrum validator/staker configuration. Validators verify L2 state against L1. Watchtower mode (enabled by default) monitors for invalid states. Staker strategies determine asserting behavior. Note: Mainnet validators require allow-listing."
      />
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={stakerEnable}
            onChange={(e) => onChange('config.stakerEnable', e.target.checked)}
          />
          Enable staker/validator mode
        </label>
      </div>
      {stakerEnable && (
        <div className="form-group">
          <label>
            Staker Strategy
            <HelpTooltip content="Validator assertion strategy. Defensive: Only dispute invalid states (recommended). StakeLatest: Always stake on latest assertion. Requires L1 gas for staking." />
          </label>
          <select
            value={stakerStrategy || 'Defensive'}
            onChange={(e) => onChange('config.stakerStrategy', e.target.value)}
          >
            <option value="Defensive">Defensive</option>
            <option value="MakeNodes">MakeNodes</option>
            <option value="ResolveNodes">ResolveNodes</option>
            <option value="StakeLatest">StakeLatest</option>
          </select>
        </div>
      )}
    </div>
  );
}
