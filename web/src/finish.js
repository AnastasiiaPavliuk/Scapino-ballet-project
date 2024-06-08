//const ipc = require('electron').ipcRenderer;


window.electronAPI.on('finish', (...args) => {
    console.log(args);
});