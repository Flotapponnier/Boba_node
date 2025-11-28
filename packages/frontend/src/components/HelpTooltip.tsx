import { useState } from 'react';
import bobaClueIcon from '../assets/boba_clue.png';
import './HelpTooltip.css';

interface HelpTooltipProps {
  content: string;
}

export default function HelpTooltip({ content }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="help-tooltip-container">
      <img
        src={bobaClueIcon}
        alt="Help"
        className="help-tooltip-icon"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className="help-tooltip-bubble">
          {content}
        </div>
      )}
    </div>
  );
}
