import HelpTooltip from '../../HelpTooltip';
import SectionHeader from '../../SectionHeader';

interface ValidatorSectionProps {
  validator?: {
    enabled: boolean;
    consensusClient?: string;
    feeRecipient?: string;
    graffiti?: string;
  };
  onChange: (path: string, value: any) => void;
}

export default function ValidatorSection({ validator, onChange }: ValidatorSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Validator Configuration"
        tooltip="Ethereum Proof-of-Stake validator settings. Requires running both execution client (Geth) and consensus client (Prysm, Lighthouse, etc.) together. Validators need 32 ETH stake. Fee recipient address receives transaction tips and MEV rewards."
      />
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={validator?.enabled || false}
            onChange={(e) => {
              if (e.target.checked) {
                onChange('validator', {
                  enabled: true,
                  consensusClient: 'prysm',
                  feeRecipient: '',
                  graffiti: '',
                });
              } else {
                onChange('validator', { enabled: false });
              }
            }}
          />
          Enable validator mode (requires consensus client)
        </label>
      </div>
      {validator?.enabled && (
        <>
          <div className="form-group">
            <label>
              Consensus Client
              <HelpTooltip content="Consensus layer client for validator. Each has different resource requirements and features. Client diversity is important for network health." />
            </label>
            <select
              value={validator?.consensusClient || 'prysm'}
              onChange={(e) => onChange('validator.consensusClient', e.target.value)}
            >
              <option value="prysm">Prysm</option>
              <option value="lighthouse">Lighthouse</option>
              <option value="teku">Teku</option>
              <option value="nimbus">Nimbus</option>
              <option value="lodestar">Lodestar</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              Fee Recipient Address
              <HelpTooltip content="Ethereum address to receive transaction priority fees and MEV rewards. Must be a valid Ethereum address starting with 0x." />
            </label>
            <input
              type="text"
              value={validator?.feeRecipient || ''}
              onChange={(e) => onChange('validator.feeRecipient', e.target.value)}
              placeholder="0x..."
            />
          </div>
        </>
      )}
    </div>
  );
}
