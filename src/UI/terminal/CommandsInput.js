import React from 'react';
import {useRef } from 'react';
import "./Terminal.css";
const { sendToMain, receiveFromMain, endConnection } = window.electron;
import useForm from '../../hooks/useForm';
import UserCmdStore from '../../../public/utils/userCmdStore';

// this is not being use in the app for now

// stores user typed commands
const userCmdStore = new UserCmdStore();

export default function CommandsInput() {
    const { inputs, handleChange, resetForm } = useForm({
        cliInput: ''
      });
    // let command;
    const textAreaRef = useRef(null);

    // moves the focus back to position zero after command is sent
    function focusInput() {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
            textAreaRef.current.selectionStart = 0;
            textAreaRef.current.selectionEnd = 0;
        }
    }

    function handleSubmit(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendToMain('cli:command', {command :inputs.cliInput});
            // add command to a stack of user entered commands
            userCmdStore.add(inputs.cliInput);
            // resets the index so the if previous command was called it is added to the top of the stack. 
            userCmdStore.idx = userCmdStore.length;
            resetForm();
            focusInput()
            console.log("COMMAND IN CLI  INPUT", cliCommand)
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
    )
}
