import React, {useContext, useState} from "react";
import "../../../index.css";
import "../../Buttons.css";
const { sendToMain } = window.electron;
import CommandButton from "../../GlobalComponents/CommandButton"; 
const { receiveFromMain, endConnection, sendToMainAndAwait } = window.electron;
import userCmdContext from "../../../../public/context/userCmdContext";
import Tooltip from "../../GlobalComponents/ToolTip";
import ToolLabel from "../../GlobalComponents/ToolLabel";
import LineSeparator from "../../GlobalComponents/LineSeparator";

export default function NodeJsEnv() {
    const [shellActivated, setShellActivated] = useState(false);
    const { clickActivatedCmd, handleInteractiveDataMode } = useContext(userCmdContext);

    function sendCommand(command){
        sendToMain('buttonActivated:command', { command });
        clickActivatedCmd(command);
    }

    function handleShellActivation(command) {
        setShellActivated(!shellActivated);
        sendCommand(command)
    }
    
    async function getListOfDependencies(){
        try {
            const dependencies = await sendToMainAndAwait('cli:npmDependencies');
            handleInteractiveDataMode(dependencies)
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="container-column">
            <div className="container-row">
            <h2>Node.js Environment</h2>
                <Tooltip tooltipContent={"Make sure Node.js and npm are installed locally and add Node.js to PATH environment variable on Windows"}>
                <div
                        role="button"
                        aria-describedby="tooltip-content"
                        aria-label="Help information"
                        className="tooltip-icon"
                    >
                    {/* info icon */}
                    &#x1F6C8;
                </div>
                </Tooltip>
            </div>

            <div className="container-row ">
                <CommandButton 
                    buttonText="Node version"
                    command="node --version"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
                <CommandButton 
                    buttonText="npm version"
                    command="npm --version"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <LineSeparator />
            {/* -----Initializing new project---- */}
            <ToolLabel 
                label="Start a New Node.js Project" 
                helpText='
                Custom setup: is a step by step guide for setting up a new Node.js project\n
                Quick setup: creates a new project with default settings' 
            />
            <div className="container-row">
                <CommandButton 
                    buttonText="Custom"
                    command="npm init"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
                <CommandButton 
                    buttonText="Quick"
                    command="npm init -y"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <LineSeparator />

            {/* ---------Node shell ---------- */}
            <ToolLabel 
                label="Node shell" 
                helpText='
                - Enter: starts the node shell\n
                - Exit: exits the node shell
                ' 
            />
            <div className="container-row ">
                <CommandButton 
                    buttonText={shellActivated ? 'Exit' : 'Enter'}
                    command={shellActivated ? '.exit' : 'node'}
                    buttonType="secondary"
                    onClick={handleShellActivation}
                />
            </div>
            <LineSeparator />

            <ToolLabel 
                label="Manage dependencies" 
                helpText='
                - List dependencies: displays project dependencies from the package.json file in the current directory\n
                - List outdated: displays outdated dependencies in the project
                ' 
            />
            <div className="container-row ">
                <CommandButton 
                    buttonText={'List dependencies'}
                    command={''}
                    buttonType="secondary"
                    onClick={getListOfDependencies}
                />
                <CommandButton 
                    buttonText={'List outdated'}
                    command={'npm outdated'}
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <LineSeparator />

            <ToolLabel 
                label="Install dependencies" 
                helpText='
                - Install dependencies: installs all the dependencies listed in the package.json file in the current directory
                ' 
            />
            <div className="container-row ">
                <CommandButton 
                    buttonText={'Install dependencies'}
                    command={'npm install'}
                    buttonType="secondary"
                    onClick={getListOfDependencies}
                />
            </div>
        </div>
    )
}