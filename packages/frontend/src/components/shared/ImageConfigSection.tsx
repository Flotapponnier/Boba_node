import { ChainConfig } from '../../config/chainConfig';
import HelpTooltip from '../HelpTooltip';
import SectionHeader from '../SectionHeader';

interface ImageConfigSectionProps {
  config: any;
  onChange: (path: string, value: any) => void;
  chainConfig: ChainConfig;
}

export default function ImageConfigSection({ config, onChange, chainConfig }: ImageConfigSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Image Configuration"
        tooltip={chainConfig.tooltips.imageConfig}
      />
      <div className="form-grid three-columns">
        <div className="form-group">
          <label>
            Repository
            <HelpTooltip content={`Docker image repository. Default: ${chainConfig.defaultImage.repository}`} />
          </label>
          <input
            type="text"
            value={config?.image?.repository || ''}
            onChange={(e) => onChange('image.repository', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Tag
            <HelpTooltip content={`Image version tag. Default: ${chainConfig.defaultImage.tag}. Always verify the latest stable version.`} />
          </label>
          <input
            type="text"
            value={config?.image?.tag || ''}
            onChange={(e) => onChange('image.tag', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Pull Policy
            <HelpTooltip content="When to pull the image. IfNotPresent: Use cached image. Always: Pull on every restart. Never: Only use local image." />
          </label>
          <select
            value={config?.image?.pullPolicy || 'IfNotPresent'}
            onChange={(e) => onChange('image.pullPolicy', e.target.value)}
          >
            <option value="IfNotPresent">IfNotPresent</option>
            <option value="Always">Always</option>
            <option value="Never">Never</option>
          </select>
        </div>
      </div>
    </div>
  );
}
