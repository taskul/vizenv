function checkPythonShell(data, pyShell) {
    if (data.includes('Python') && data.includes('on ' + process.platform)) {
        pyShell = true;
        
    }
}