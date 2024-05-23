import React from 'react';


const TerminalLine = React.memo(({ text, counter, className}) => {
    let symbol;
    switch(className){
        case 'terminal-warning':
            symbol = '⚠️';
            break;
        case 'terminal-error':
            symbol = '❌';
            break;
        case 'terminal-info':
            symbol = ' ℹ️ ';
            break;
        default:
            symbol = '';
    }

    return <p className={className}><span>{"> "}{counter}{text}</span><span>{symbol}</span></p>;
});

export default TerminalLine;