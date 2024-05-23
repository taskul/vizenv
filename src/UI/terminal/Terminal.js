import update from 'immutability-helper'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import "./Terminal.css";
import "../../UI/Buttons.css";
const { sendToMain, receiveFromMain, endConnection } = window.electron;
import { checkDirChangeCmd } from '../../../public/utils/changeDirectory.js';
import processOutput from '../../../public/utils/processOutput.js'
import TerminalLine from './TerminalLine.js';
import useForm from '../../hooks/useForm';
import UserCmdStore from '../../../public/utils/userCmdStore';
import UserInputContainer from './UserInputContainer';
import userCmdContext from '../../../public/context/userCmdContext.js';
import ToggleSwitch from '../GlobalComponents/ToggleSwitch.js';
import SideMenu from '../SideMenu/SideMenu.js';

let counter = 0;
// stores user typed commands that then can be used for checking what command was executed to manage display of the terminal output
let cliCommand;

// stores user typed commands
const userCmdStore = new UserCmdStore();

// management of user commands in the text area input field
function CommandsInput() {
    const { inputs, handleChange, resetForm } = useForm({
        cliInput: ''
      });
    const [toggleMultiline, setToggleMultiline] = useState(false);

    const textAreaRef = useRef(null);

    // moves the focus back to position zero after command is sent
    function focusInput() {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
            textAreaRef.current.selectionStart = 0;
            textAreaRef.current.selectionEnd = 0;
        }
    }

    function handleMultilineSubmit(e) {
        e.preventDefault();
        const lines = inputs.cliInput.split('\n');
        lines.forEach(line => {
            sendToMain('cli:command', {command : line});
            // add command to a stack of user entered commands
            userCmdStore.add(line);
            // resets the index so the if previous command was called it is added to the top of the stack. 
            userCmdStore.idx = userCmdStore.length;
        })
        sendToMain('cli:command', {command : ''});
        resetForm();
        focusInput()
    }

    function handleSubmit(e) {
        if (!toggleMultiline) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendToMain('cli:command', {command :inputs.cliInput});
                cliCommand = inputs.cliInput;
                // add command to a stack of user entered commands
                userCmdStore.add(inputs.cliInput);
                // resets the index so the if previous command was called it is added to the top of the stack. 
                userCmdStore.idx = userCmdStore.length;
                resetForm();
                focusInput()
            }        
        } 
        if (e.key === 'Enter' && e.ctrlKey && toggleMultiline) {
                handleMultilineSubmit(e);
            }
        // scroll through previously entered user commands. 
        if (e.key === 'ArrowUp') {
            const cmd = userCmdStore.prevCmd();
            if (cmd) {
                // visually changes the command in input field
                textAreaRef.current.value = cmd;
                // changes input value in the useForm hook
                inputs.cliInput = cmd;
            } else {
                textAreaRef.current.value= '';
            }
            
        }
        if (e.key === 'ArrowDown') {
            const cmd = userCmdStore.nextCmd();
            if (cmd) {
                // visually changes the command in input field
                textAreaRef.current.value= cmd;
                // changes input value in the useForm hook
                inputs.cliInput = cmd;
            } else {
                textAreaRef.current.value = '';
            }
        }
    }

    return (
        <div className="textarea-buttons-container">
            <textarea 
                type="text" 
                name="cliInput" 
                id="input-field" 
                ref={textAreaRef}
                autoComplete="off" 
                placeholder="Type your command here..." 
                value={inputs.cliInput} 
                onChange={handleChange} 
                onKeyDown={handleSubmit}
                >

            </textarea>
            <div className='cli-buttons-container'>
                <div className="container-row">
                    <ToggleSwitch 
                        label="Multiline Mode" 
                        checked={toggleMultiline}
                        setChecked={setToggleMultiline}
                        />
                </div>
                {toggleMultiline 
                    ?
                    <div className="container-column">
                        <button 
                            className={`btn-primary ${toggleMultiline ? 'visible' : ''}`}
                            onClick={handleMultilineSubmit}

                        >&#9654;
                        </button>
                        <p className="no-margin">"Ctrl+Enter"</p>
                    </div>
                    :
                    null
                }
            </div>

        </div>
    )
}

// terminal component that displays the output of the commands
const Terminal = React.memo(function Terminal() {
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [manualCmdActivated, setManualCmdActivated] = useState(false);
    const [manualCmd, setManualCmd] = useState('');
    const terminalRef = useRef(null);
    // helps to determine if the command was activated by the user by clicking on UI element
    let clickEnteredCmd = false;
    console.log('Counter', counter++);

    const handleData = useCallback((data) => {
        console.log('Data before rendering and splittings', data);  
        data = data.replace('\r', '');
        const lines = data.split('\n');
        // if command is undefined that means user did not enter it in cli.
        if (cliCommand === undefined || cliCommand === 'cd') {
            checkDirChangeCmd(lines, cliCommand, clickEnteredCmd)
        }

        setTerminalOutput(prev => 
            [...prev, ...lines
                .filter(line => line.trim() !== '' && line.trim() !== '>>>') // Filter out empty lines and >>> lines
                .map((line, index) => 
                    ({ 
                        id: `${prev.length}-${index}`, 
                        // Change the look of the line depending if it is a user command, error, or normal output
                        class: clickEnteredCmd ? "terminal-command" : processOutput(line, cliCommand), 
                        text: line 
                    }))
            ],            
        );
        clickEnteredCmd = false;
        
        if (manualCmd) {
            updateClickActivatedCmd();
            setManualCmd('');
        }

        // clear the screen
        if (cliCommand === 'cls') {
            setTerminalOutput([])
        }
    }, []);  

    const handleErrors = useCallback((error) => {
        if (error) {
            const errorType = error.startsWith('WARNING:') ? 'terminal-warning' : 'terminal-error';
            setTerminalOutput(prev => [...prev, { id: `error-${prev.length}`, class: errorType, text: error }]);
        }
    }, []);  

 
    useEffect(() => {
        receiveFromMain('cli:reply', handleData);
        receiveFromMain('cli:error', handleErrors);

        return () => {
            endConnection('cli:reply', handleData);
            endConnection('cli:error', handleErrors);
        };
    },[])

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    return (
        <main>
            <div id="terminal" ref={terminalRef}>
                {terminalOutput.map((output) => (
                    <TerminalLine
                        key={output.id}
                        className={output.class}
                        text={output.text}
                        counter={counter}
                    />
                ))}
            </div>
            <SideMenu />
            <userCmdContext.Provider value={{manualCmdActivated, setManualCmdActivated, manualCmd, setManualCmd}}>
                <UserInputContainer>
                    <CommandsInput />
                </UserInputContainer>
            </userCmdContext.Provider>
        </main>
    )
})

export default Terminal;