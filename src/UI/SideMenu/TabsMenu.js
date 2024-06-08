import React, { useState, useCallback } from 'react';
import "./TabsMenu.css";
import PythonEnv from '../Environments/Python/PythonEnv';
import NodeJsEnv from '../Environments/NodeJs/NodeJsEnv';

const publicUrl = window.electron.process.env.PUBLIC_URL;

export default function TabsMenu() {
    const [activeTab, setActiveTab] = useState('tab-python');

    const changeTabState = useCallback((e) => {
        const id = e.target.closest('button').id;
        setActiveTab(id);
    }, []);

    return (
        <div className="container-for-tabs">
            <div className="container-tabs">
                <button 
                    className={activeTab === 'tab-python' ? 'tablinks active' : 'tablinks'} 
                    id="tab-python" 
                    onClick={changeTabState}
                    role="tab"
                    aria-selected={activeTab === 'tab-python'}
                    aria-controls="python-panel"
                    tabIndex="0"
                >
                    <img src={`${publicUrl}/images/icons8-python-48.png`} alt="Python icon" className='tabs-icons'/>
                    Python
                </button>
                <button 
                    className={activeTab === 'tab-node' ? 'tablinks active' : 'tablinks'} 
                    id="tab-node" 
                    onClick={changeTabState}
                    role="tab"
                    aria-selected={activeTab === 'tab-node'}
                    aria-controls="node-panel"
                    tabIndex="0"
                >
                    <img src={`${publicUrl}/images/icons8-node-js-48.png`} alt="NodeJS icon" className='tabs-icons'/>
                    Node.js
                </button>
            </div>
            {activeTab === 'tab-python' && <div className="tabcontent" id="python-panel" role="tabpanel" aria-labelledby="tab-python">
                <PythonEnv />
            </div>}
            {activeTab === 'tab-node' && <div className="tabcontent" id="node-panel" role="tabpanel" aria-labelledby="tab-node">
                <NodeJsEnv />
            </div>}
        </div>
    );
}
