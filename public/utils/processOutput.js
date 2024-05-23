// manages the output of the terminal, helps to change the class of the output depending on the content of the output
function processOutput(data, command) {
    const line = data.toLowerCase();
    let elementClass = 'terminal-output';

    if (line.includes('usage:') || line.includes('options:') || line.includes('info:') || line.includes('help:') || line.includes('commands:')) {
        elementClass = 'terminal-info'; 
    }
    if (line === command) {
        elementClass = 'terminal-command'
    }
    return elementClass;
}

module.exports = processOutput;