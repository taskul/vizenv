import React, { useEffect, useState, useContext } from 'react';
import "./Terminal.css";
import userCmdContext from '../../../public/context/userCmdContext';
const { receiveFromMain, endConnection, sendToMainAndAwait } = window.electron;
userCmdContext

export default function CwdUiPath() {
    const [cwd, setCwd] = useState('');
    const { manualCmdActivated, setManualCmdActivated, manualCmd, setManualCmd} = useContext(userCmdContext);

    useEffect(() => { 
        const handleTerminalStart = (currentDirectory) => {
            setCwd(currentDirectory);
        };

        // Receive the current directory from main process only once when the component mounts
        receiveFromMain('terminal:start', handleTerminalStart);

        // Clean up event listener when component unmounts
        return () => {
            endConnection('terminal:start', handleTerminalStart);
            endConnection('open:directory')
        };
    }, []); 

    async function openFileDirectory(){
        try {
            const directoryPath = await sendToMainAndAwait('open:directory');
            setManualCmdActivated(true);
            setManualCmd(directoryPath);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <a id="current-directory" className="current-cwd"  href="#" onClick={openFileDirectory}>cwd: {cwd}</a> 
        </>
    );
}

