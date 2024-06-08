import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import './ToolTip.css';

/**
 * [Displays a tooltip when hovering over. Lines can be split by using '\n' in the content string.]
 */

const Tooltip = ({ children, tooltipContent }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);

  const calculatePosition = () => {
    if (targetRef.current && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      // starting position for the tooltip
      let top = 0;
      let left = 0;
      // Ensuring the tooltip does not go out of the viewport
      if (tooltipRect.left + tooltipRect.width > window.innerWidth) left = left - tooltipRect.width;
      if (tooltipRect.bottom + tooltipRect.height > window.innerHeight) top = top - tooltipRect.height;

      setTooltipPosition({ top, left });
    }
  };

  useEffect(() => {
    if (showTooltip) {
        calculatePosition();
    }
  }, [showTooltip]);


  const handleMouseEnter = () => {
    setShowTooltip(true);    
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setTooltipPosition({ top: 0, left: 0 });
  };

  const handleFocus = () => {
    setShowTooltip(true);
  };

  const handleBlur = () => {
    setShowTooltip(false);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <div
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex="0"
        aria-describedby="tooltip"
        style={{ cursor: 'pointer' }}
      >
        {children}
      </div>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`tooltip-content`}
          style={{ 
            top: tooltipPosition.top, 
            left: tooltipPosition.left, 
            position: 'absolute', 
            textAlign: 'start',
            width: '150px', 
          }}
        >
          {tooltipContent.split('\\n').map((line, index) => (
            <p key={`toolTip-${index}`}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
