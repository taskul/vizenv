import React from "react";
import Tooltip from "./ToolTip";

/**
 * [Displays a label with a help icon that displays a tooltip when hovered over.]
 * @param {String} label [The label to be displayed.]
 * @param {String} helpText [The text to be displayed in the tooltip. use '\n' to split lines.]
 */

export default function ToolLabel({label, helpText}) {
    return (
        <div className="container-row">
            <p className="no-margin">{label}</p>
            <Tooltip 
                tooltipContent={helpText}
            >
                <div
                    role="button"
                    aria-describedby="tooltip-content"
                    aria-label="Help information"
                    tabIndex="0"
                    className="tooltip-icon"
                >
                {/* info icon */}
                &#x1F6C8;
                </div>
            </Tooltip>
        </div>
    )
}