import React from 'react';
import "./Terminal.css";
import CwdUiPath from './CwdPath.js';

export default function UserInputContainer({children}) {
    return (
        <div id="input-container">
            <CwdUiPath />
            {children}
        </div>
    )
}
