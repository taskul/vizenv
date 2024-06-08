import React from 'react';

const TerminalLine = React.memo(({ text, className, updatePackage, removePackage}) => {
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
        case 'terminal-package':

        default:
            symbol = '';
    }

    function update(packageName){
        updatePackage(packageName)
    }

    function remove(packageName){
        removePackage(packageName)
    }

    if (className === 'terminal-package') {
         const packageName = text[0]
        return (
            <div className='container-row no-margin' role="group" aria-labelledby={`package-${packageName}`}>
                <p className='no-margin' id={`package-${packageName}`}>
                    Name: <span className="bold-text">{text[0]} </span>
                    Version: <span className="bold-text">{text[1]}</span>
                </p>
                <button 
                    className="btn-secondary" 
                    onClick={() => update(packageName)}
                    aria-label={`Install the latest version of ${packageName}`}
                >Install latest</button>
                <button 
                    className="btn-secondary" 
                    onClick={() => remove(packageName)}
                    aria-label={`Remove package called ${packageName}`}
                >Remove</button>
            </div>
            )
    } else {
        return <p className={className}><span>{"> "}{text}</span><span>{symbol}</span></p>;
    }
});

export default TerminalLine;