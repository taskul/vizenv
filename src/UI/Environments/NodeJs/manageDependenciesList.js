import { v4 as uuidv4 } from 'uuid';
/**
 * Function to manage the list of dependencies returned from the backend and display them to the user with the terminal output
 * 
 * @param {object} data - The data object containing dependencies and devDependencies
 * @param {function} setTerminalOutput - The function to update the terminal output state
 */
export function manageDependenciesList(data) {
    if (data && Object.keys(data).length > 0) {
        let newOutput = []; 
        
        if (!data.error) {
            if (data.packageManager === 'npm') {
                newOutput.push({
                    id: `package-label-1-${uuidv4()}`,
                    class: 'terminal-package-label',
                    text: `Dependencies:`
                });
            } else if (data.packageManager === 'pip') {
                newOutput.push({
                    id: `package-label-1-${uuidv4()}`,
                    class: 'terminal-package-label',
                    text: `Installed Python packages:`
                });
            }

            if (data.dependencies) {
                newOutput.push(...data.dependencies.map((dep) => ({
                    id: `package-dep-${uuidv4()}`,
                    class: 'terminal-package',
                    text: dep
                })));
            }

            if (data.packageManager === 'npm') {
                newOutput.push({
                    id: `package-label-2-${uuidv4()}`,
                    class: 'terminal-package-label',
                    text: `devDependencies:`
                });
            }

            if (data.devDependencies) {
                newOutput.push(...data.devDependencies.map((dev) => ({
                    id: `package-dev-${uuidv4()}`,
                    class: 'terminal-package',
                    text: dev
                })));
            }
        } else {
            newOutput = [{
                id: `terminal-error-Err-${uuidv4()}`,
                class: 'terminal-error',
                text: data.error
            }];
        }
        
        return newOutput
    }
}

