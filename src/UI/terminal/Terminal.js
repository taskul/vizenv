import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import "./Terminal.css";
import "../../UI/Buttons.css";
const { sendToMain, receiveFromMain, endConnection, sendToMainAndAwait } = window.electron;
import { checkDirChangeCmd } from '../../../public/utils/changeDirectory.js';
import processOutput from '../../../public/utils/processOutput.js'
import TerminalLine from './TerminalLine.js';
import useForm from '../../hooks/useForm';
import UserCmdStore from '../../../public/utils/userCmdStore';
import UserInputContainer from './UserInputContainer';
import userCmdContext from '../../../public/context/userCmdContext.js';
import ToggleSwitch from '../GlobalComponents/ToggleSwitch.js';
import SideMenu from '../SideMenu/SideMenu.js';
import { manageDependenciesList } from '../Environments/NodeJs/manageDependenciesList.js';
import processPythonPackages from '../Environments/Python/HandlePythonPackages.js';

// stores user typed commands that then can be used for checking what command was executed to manage display of the terminal output
let cliCommand;
let packageManagerCommand;
let dataAccumulator = [];
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
        // move to next line which is empty, this is to visually show that the command was sent
        sendToMain('cli:command', {command : ''});
        resetForm();
        focusInput()
    }



    async function handleSubmit(e) {
        if (!toggleMultiline) {
            if (e.key === 'Enter') {
                e.preventDefault();
                cliCommand = inputs.cliInput.trim().toLowerCase();
                sendToMain('cli:command', {command :cliCommand});
                // add command to a stack of user entered commands
                userCmdStore.add(cliCommand);
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
function Terminal() {
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [manualCmdActivated, setManualCmdActivated] = useState(false);
    const [manualCmd, setManualCmd] = useState('');
    const terminalRef = useRef(null);

    const handleData = useCallback((data) => {
        data = data.replace('\r', '');
        const lines = data.split('\n');
        // if command is undefined that means user did not enter it in cli.
        if (cliCommand === undefined || cliCommand.trim() === 'cd') {
            checkDirChangeCmd(lines, cliCommand)
        }
        if (cliCommand.trim() === 'pip list') {
            handlePythonPackages(lines);
        } else {
            setTerminalOutput(prev => 
                [...prev, ...lines
                    .filter(line => line.trim() !== '' && line.trim() !== '>>>') // Filter out empty lines and >>> lines
                    .map((line, index) => 
                        ({ 
                            id: `${prev.length}-${index}`, 
                            // Change the look of the line depending if it is a user command, error, or normal output
                            class: processOutput(line, cliCommand), 
                            text: line 
                        }))
                ],            
            );
        }

        // clear the screen
        if (cliCommand === 'cls') {
            setTerminalOutput([])
        }
    }, []);  

    // this starts an interactive package manager mode in a terminal output for managing dependencies and libraries
    const handleInteractiveDataMode = useCallback((data) =>{
        packageManagerCommand = data.packageManager;
        const modifiedData = manageDependenciesList(data);
        setTerminalOutput(prev => [...prev, ...modifiedData]);              
    }, []);

    // check if string is a directory 
    function startsWithDriveLetter(line) {
        // This regex matches strings that start with any drive letter followed by ":\"
        const regex = /^[a-zA-Z]:\\/;
        return regex.test(line);
    }

    // handles the output of the pip list command
    const handlePythonPackages = useCallback((data) => {
        processPythonPackages(data, dataAccumulator, handleInteractiveDataMode, startsWithDriveLetter);
    }, []);

    const updatePackage = useCallback((packageName) => {
        if (packageManagerCommand === 'npm') {
            sendToMain('cli:command', {command: `${packageManagerCommand} install ${packageName}@latest`});
            // setting cliCommand to the command that was sent to the main process will help with displaying the output of the command in the terminal
            cliCommand = `${packageManagerCommand} install ${packageName}@latest`;
        } else if (packageManagerCommand === 'pip') {
            sendToMain('cli:command', {command: `${packageManagerCommand} install --upgrade ${packageName}`});
            cliCommand = `${packageManagerCommand} install --upgrade ${packageName}`;
        }
    });

    const removePackage = useCallback((packageName) => {
        sendToMain('cli:command', {command: `${packageManagerCommand} uninstall ${packageName}`});
        cliCommand = `${packageManagerCommand} uninstall ${packageName}`;
    });

    // process errors by first splitting them into array of lines, then rendering them with a CSS class that specifies error or warning
    const handleErrors = useCallback((error) => {
        if (error) {
            const errorType = error.startsWith('WARNING:') ? 'terminal-warning' : 'terminal-error';
            const lines = error.replace('\r', '').split('\n');

            setTerminalOutput(prev => [...prev, ...lines.map((line, index) => ({ id: `error-${prev.length}-${index}`, class: errorType, text: line }))
            ])
        }
    }, []);  

    const clickActivatedCmd = useCallback((cmd) => {
        // set global cliCommand to click activated cmd passed from a child component
        cliCommand = cmd;
    },[]);

 
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

    const contextValue = useMemo(() => ({
        clickActivatedCmd,
        manualCmdActivated,
        setManualCmdActivated,
        manualCmd,
        setManualCmd,
        updatePackage,
        removePackage,
        handleInteractiveDataMode,
    }), [clickActivatedCmd, manualCmdActivated, manualCmd]);

    return (
        <main>
            <div id="terminal" ref={terminalRef}>
                {terminalOutput.map((output) => (
                    <TerminalLine
                        key={output.id}
                        className={output.class}
                        text={output.text}
                        updatePackage={updatePackage}
                        removePackage={removePackage}
                    />                    
                ))}
            </div>
            <userCmdContext.Provider value={contextValue}>
            <SideMenu />
            <UserInputContainer>
                <CommandsInput />
            </UserInputContainer>
            </userCmdContext.Provider>
        </main>
    )
}

export default Terminal;