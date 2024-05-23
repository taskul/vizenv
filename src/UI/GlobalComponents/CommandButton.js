import React from "react";

export default function CommandButton({ buttonText, command, buttonType, onClick }) {
    return (
        <button className={`btn-${buttonType}`} onClick={() => onClick(command)}>
            {buttonText}
        </button>
    );
}
