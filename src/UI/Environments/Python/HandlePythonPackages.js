// this file is responsible for handling the output of the command 'pip list' in the interactive mode

function processPythonPackages(data, dataAccumulator, handleInteractiveDataMode, startsWithDriveLetter) {
    // check if there is data
    if (data && data.length > 1) {
        // sometimes data is returned in chunks, so we need to accumulate it
        if (data.length === 2) {
            // avoid emply strings
            if (data[1].trim() === '') return;
            if (!startsWithDriveLetter(data[1]) && !data[1].startsWith('----------') && !data[1].startsWith('(venv)')) {
                dataAccumulator.push(data[1]);
                return
            } else {
                const pythonPackages = {
                    packageManager: 'pip',
                    dependencies: dataAccumulator.reduce((acc, line) => {
                        if (line && line.trim() !== '') {
                            const [module, version] = line.split(/\s+/);
                            acc.push([module, version]);
                        }
                        return acc;
                    }, []),
                };
                if (pythonPackages.dependencies.length > 0) {
                    handleInteractiveDataMode(pythonPackages);
                    dataAccumulator.splice(0, dataAccumulator.length);
                }
            }                
        } else {
            const pythonPackages = {
                packageManager: 'pip',
                dependencies: data.slice(2).reduce((acc, line) => {
                    if (line && line.trim() !== '') { 
                        const [module, version] = line.split(/\s+/);
                        acc.push([module, version]);
                    }
                    return acc;
                }, []),
            };
            handleInteractiveDataMode(pythonPackages);
        }
    }
}

export default processPythonPackages;