import React from "react";
import "../../../index.css";
import "../../Buttons.css";

export default function NodeJsEnv() {
    return (
        <div className="container-column">
            <h2>Node.js Environment</h2>
            <p>Node shell</p>
            <div className="container-row ">
                <button className="btn-secondary ">Activate</button>
            </div>
        </div>
    )
}