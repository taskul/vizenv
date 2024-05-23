const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sendToMain: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  // await a response from the main process
  sendToMainAndAwait: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  receiveFromMain: (channel, listener) => {
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
  endConnection: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener);
  },
  process: {
    platform: process.platform,
    env: process.env,
  }
});
