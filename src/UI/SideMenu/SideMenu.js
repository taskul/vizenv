import React, { useState, useRef, useCallback, useEffect } from 'react';
import './SideMenu.css';
import TabsMenu from './TabsMenu';

export default function SideMenu() {
  const sidebarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(500);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        // 80% of screen width
        const maxWidth = window.innerWidth * 0.8;
        // 10% of screen width 
        const minWidth = window.innerWidth * 0.2; 
        if (newWidth < minWidth) {
          setSidebarWidth(minWidth);
        } else if (newWidth > maxWidth) {
          setSidebarWidth(maxWidth);
        } else {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div 
        className="side-menu-container"
        style={{right: isOpen ? 0 : -sidebarWidth}}
    >
      <div
        ref={sidebarRef}
        className={`side-menu ${isOpen ? 'open' : ''}`}
        style={{ width: sidebarWidth }}
      >
        <button 
            onClick={toggleMenu} 
            className="btn-menu-toggle"
            style={{left: isOpen ? -50 : -sidebarWidth+-50}}
        >
          {isOpen ? '-' : '+'}
        </button>
        <TabsMenu />
        <div className="side-menu-resizer" onMouseDown={startResizing} />
      </div>
    </div>
  );
};

