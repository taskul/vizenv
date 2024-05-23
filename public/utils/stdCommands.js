function stdCommands(command) {
    switch (command) {
        case 'cls':
            const terminal = document.getElementById('terminal');
            terminal.innerHTML = '';
            break;
        default:
            break;
    }
}

module.exports = stdCommands;