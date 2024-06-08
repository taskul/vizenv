import React from "react";
import Tooltip from "./ToolTip";

export default function ToolLabel({label, helpText}) {
    return (
        <div className="container-row">
            <p className="no-margin">{label}</p>
            <Tooltip 
                tooltipContent={helpText}
            >
                <button
                    aria-describedby="tooltip-content"
                    aria-label="Help information"
                    className="tooltip-content"
                >
                ❔
                </button>
            </Tooltip>
        </div>
    )
}