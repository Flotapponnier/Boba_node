import HelpTooltip from './HelpTooltip';

interface SectionHeaderProps {
  title: string;
  tooltip: string;
}

export default function SectionHeader({ title, tooltip }: SectionHeaderProps) {
  return (
    <h2 className="section-header-with-tooltip">
      {title}
      <HelpTooltip content={tooltip} />
    </h2>
  );
}
