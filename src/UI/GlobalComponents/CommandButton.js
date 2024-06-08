import React from "react";

export default function CommandButton({ buttonText, command, buttonType, onClick }) {
    return (
        <button 
            className={`btn-${buttonType}`} 
            onClick={() => onClick(command)}
            aria-label={buttonText}
            tabIndex="0"
        >
            {buttonText}
        </button>
    );
}
