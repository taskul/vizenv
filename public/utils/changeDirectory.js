// ------------------Main Process functions

// Desc: This will update the current working directory of the terminal interface for the user.
// The actual change of the directory will be handled by the main process and node-pty.
// >>>Used in a main.js
function changedDirectory(data, curCommand, cwd, window, dirChangedByClick) {
    const promptPattern = /^([A-Za-z]:\\[^>]+>)$/m;
    try {
        if (dirChangedByClick) {
            window.webContents.send('cli:reply', `cd ${cwd}`);
            window.webContents.send('terminal:start', cwd);
            return cwd;
        }
        else {
            let cleanedData = data;
            console.log("DATA", JSON.stringify(data));
            // sending data to the UI so it can be displayed as user entered
            if (data.startsWith('cd ')) {
                // if command and new directory come back in one string, this will clean it up so only the new directory is returned
                cleanedData = data.replace(curCommand, '');
                window.webContents.send('cli:reply', curCommand);
            }
            // if the data is a directory path, update the UI with the new directory
            if (promptPattern.test(cleanedData)) {
                window.webContents.send('terminal:start', cleanedData);
                window.webContents.send('cli:reply', cleanedData);
                console.log("Changed directory to:", cleanedData);
                return cleanedData;
            }
        }        
    } catch (err) {
        console.log("Error", err);
    }
}

// ------------------Render Process functions
function splitUpStrInArr(arr) {
    // first time "cd" is called it returns the current directory concatinated together in one string, however when it gets called after other commands it returns only one instance of the directory
    if (arr[0] == 'cd' && arr[1]) {
        if (arr[1].startsWith('cd ')) {
            arr[1] = arr[1].replace('cd ', '');
        }
        if (arr[1].split(':').length > 2) {
            arr[1] = arr[1].slice(arr[1].length/2 + 1)
        } else {
            arr[1] = '';
        }
    }
    if (arr[0].startsWith('cd ') && arr.length === 1) {
        arr[0] = arr[0].replace('cd ', '').slice(arr[0].length/2 + 1)
    }
}

// check if the command is a change directory command - "cd". 
// >>>Used in a UI terminal
function checkDirChangeCmd(arr, cmd) {
    if (cmd === undefined && arr[0].startsWith('cd ')) {
        splitUpStrInArr(arr);
    }
    if (cmd) {
        if (cmd === 'cd' || cmd.startsWith('cd ')) {
            splitUpStrInArr(arr);
        }
    }
}

module.exports = {changedDirectory, checkDirChangeCmd};  