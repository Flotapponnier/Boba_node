import HelpTooltip from '../HelpTooltip';
import SectionHeader from '../SectionHeader';

interface ImageConfig {
  repository: string;
  tag: string;
  pullPolicy: 'Always' | 'IfNotPresent' | 'Never';
}

interface ImageConfigSectionProps {
  image: ImageConfig;
  onChange: (field: keyof ImageConfig, value: string) => void;
  repositoryTooltip?: string;
  tagTooltip?: string;
  sectionTooltip?: string;
}

export default function ImageConfigSection({
  image,
  onChange,
  repositoryTooltip = "Docker image repository for the blockchain node.",
  tagTooltip = "Image version tag. Always verify the latest stable version before deploying.",
  sectionTooltip = "Docker container image configuration. Always verify the latest stable version before production deployment.",
}: ImageConfigSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Image Configuration"
        tooltip={sectionTooltip}
      />
      <div className="form-grid three-columns">
        <div className="form-group">
          <label>
            Repository
            <HelpTooltip content={repositoryTooltip} />
          </label>
          <input
            type="text"
            value={image.repository}
            onChange={(e) => onChange('repository', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            Tag
            <HelpTooltip content={tagTooltip} />
          </label>
          <input
            type="text"
            value={image.tag}
            onChange={(e) => onChange('tag', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            Pull Policy
            <HelpTooltip content="When to pull the image. IfNotPresent: Use cached image. Always: Pull on every restart. Never: Only use local image." />
          </label>
          <select
            value={image.pullPolicy}
            onChange={(e) => onChange('pullPolicy', e.target.value as any)}
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
