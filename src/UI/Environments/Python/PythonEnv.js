import React from "react";
import "../../../index.css";
import "../../Buttons.css";
import CommandButton from "../../GlobalComponents/CommandButton"; 
const { sendToMain } = window.electron;
import Tooltip from "../../GlobalComponents/ToolTip";

export default function PythonEnv() {
    const [venvActivated, setVenvActivated] = React.useState(false);

    function sendCommand(command){
        sendToMain('buttonActivated:command', { command });
    }

    function handleVenvActivation(command) {
        setVenvActivated(!venvActivated);
        sendCommand(command)
    }

    return (
        <div className="container-column">
            <h2>Python Environment</h2>
            <div className="container-row">
                <CommandButton 
                    buttonText="Python Version"
                    command="python --version"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
                <CommandButton 
                    buttonText="pip Version"
                    command="pip --version"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <div className="container-row">
                <p className="no-margin">Virtual environment</p>          
                <Tooltip tooltipContent='virtual environment directory should be called "venv"'>
                    <span>❔</span>
                </Tooltip>
            </div>
             
            <div className="container-row">
                <CommandButton 
                    buttonText={venvActivated ? 'Deactivate' : 'Activate'}
                    command={venvActivated ? 'deactivate' : 'venv\\scripts\\activate'}
                    buttonType="secondary"
                    onClick={handleVenvActivation}
                />
                <CommandButton 
                    buttonText="Create"
                    command="python -m venv venv"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <br style={{ border: 'var(--border-outline-color)' }}></br>
            <p className="no-margin">Installed packages list</p>
            <div className="container-row">
                <CommandButton 
                    buttonText="List Packages"
                    command="pip list"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <div className="container-row">
                <CommandButton 
                    buttonText="Upgrade pip"
                    command="python -m pip install --upgrade pip"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <br style={{ border: 'var(--border-outline-color)' }}></br>
            <p className="no-margin">requirements.txt</p>
            <div className="container-row">
                <CommandButton 
                    buttonText="Create"
                    command="py -m pip freeze > requirements.txt"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <br style={{ border: 'var(--border-outline-color)' }}></br>
            <p className="no-margin">Project dependencies</p>
            <div className="container-row">
                <CommandButton 
                    buttonText="Install"
                    command="py -m pip install -r requirements.txt"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
        </div>
    );
}
