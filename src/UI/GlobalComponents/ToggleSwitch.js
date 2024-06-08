import React, { useState } from 'react';
import './ToggleSwitch.css'; // Assuming you save the CSS in a separate file

export default function ToggleSwitch({label, checked, setChecked}) {
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    setIsChecked(!isChecked);
    setChecked(!isChecked);
  };

  return (
    <div className="container-row">
      <span id="toggle-switch-label">{label}</span>
      <label 
        className="switch" 
        role="switch" 
        aria-checked={isChecked} 
        aria-labelledby="toggle-switch-label"
      >
        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={handleToggle} 
          aria-hidden="true" 
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

