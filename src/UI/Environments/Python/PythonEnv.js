import React, {useContext, useState} from "react";
import "../../../index.css";
import "../../Buttons.css";
const { sendToMain } = window.electron;
import CommandButton from "../../GlobalComponents/CommandButton"; 
import Tooltip from "../../GlobalComponents/ToolTip";
import userCmdContext from "../../../../public/context/userCmdContext";
import ToolLabel from "../../GlobalComponents/ToolLabel";
import LineSeparator from "../../GlobalComponents/LineSeparator";

export default function PythonEnv() {
    const [venvActivated, setVenvActivated] = useState(false);
    const [shellActivated, setShellActivated] = useState(false);
    const { clickActivatedCmd } = useContext(userCmdContext);

    function sendCommand(command){
        sendToMain('buttonActivated:command', { command });
        clickActivatedCmd(command);
    }

    function handleVenvActivation(command) {
        setVenvActivated(!venvActivated);
        sendCommand(command)
    }

    function handleShellActivation(command) {
        setShellActivated(!shellActivated);
        sendCommand(command)
    }

    return (
        <div className="container-column">
            <div className="container-row">
                <h2>Python Environment</h2>
                <Tooltip tooltipContent={"Make sure Python is installed locally and add Python to PATH environment variable on Windows"}>
                    <button
                        aria-describedby="tooltip-content"
                        aria-label="Help information"
                        className="tooltip-content"
                    >
                    ❔
                    </button>
                </Tooltip>
            </div>
            <div className="container-row">
                <CommandButton 
                    buttonText="Python version"
                    command="python --version"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
                <CommandButton 
                    buttonText="pip version"
                    command="pip --version"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>
            <LineSeparator />
            <ToolLabel 
                label="Virtual Environment" 
                helpText='
                - Create: creates new virtual environment directory called "venv"\n
                - Activate: looks for virtual environment with a name "venv", if it exists in the current directory' 
            />
             
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
            <LineSeparator />
            <ToolLabel 
                label="Python shell" 
                helpText='
                - Starts and Stops Python interactive shell.\n
                - You can use Multiline Mode for code entry when interacting with Python shell.' 
            />
            <div className="container-row">
                <CommandButton 
                    buttonText={shellActivated ? 'Exit' : 'Enter'}
                    command={shellActivated ? 'exit()' : 'python'}
                    buttonType="secondary"
                    onClick={handleShellActivation}
                />
            </div>
            <LineSeparator />        
            <ToolLabel 
                label="Manage installed Python packages" 
                helpText='
                - Lists globally installed Python packages.\n
                - If virtual environment (venv) is activated, it will list packages installed in the virtual environment.' 
            />
            <div className="container-row">
                <CommandButton 
                    buttonText="List Packages"
                    command="pip list"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
                <CommandButton 
                    buttonText="List Outdated"
                    command="python -m pip list --outdated"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>

            <LineSeparator />
            <ToolLabel 
                label="Create requirements.txt" 
                helpText='
                - Creates a requirements.txt file with all the installed packages in the current global environment.\n
                - If virtual environment (venv) is activated, then it creates a requirements.txt file with all the installed packages in the current (venv) environment.' 
            />
            <div className="container-row">
                <CommandButton 
                    buttonText="Create"
                    command="py -m pip freeze > requirements.txt"
                    buttonType="secondary"
                    onClick={sendCommand}
                />
            </div>

            <LineSeparator />
            <ToolLabel 
                label="Project packages installation" 
                helpText='
                - Looks for a requirements.txt file in the current directory and installs all the packages listed in the file.\n
                - If you want those packages to be installed in the virtual environment, make sure to activate the virtual environment first.' 
            />
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

/* Other possible commands: 
pip search package_name
pip show package_name

Show Package Installation Path
pip show -f package_name

*/