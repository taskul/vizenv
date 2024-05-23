import React, { useState, useRef, useEffect } from 'react';
import './ToolTip.css';

const Tooltip = ({ children, tooltipContent }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Calculate the position
      let top = targetRect.top - tooltipRect.height - 5;
      let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

      // Ensure the tooltip does not go out of the viewport
      if (top < 0) top = targetRect.bottom + 5;
      if (left < 0) left = 5;
      if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 5;

      setTooltipPosition({ top, left });
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <div
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </div>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="tooltip-content"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left, position: 'absolute' }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
