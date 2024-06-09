//const ipc = require('electron').ipcRenderer;

const $distanceOutput = document.querySelector(".distance-output");

console.log($distanceOutput);


window.electronAPI.on('finish', (...args) => {
    console.log(args);
    let playerMinMax = args[0][0].playerMinMax;
    let playerTime = args[0][0].playerTime;
    $distanceOutput.innerHTML = `Player minmax: ${playerMinMax.toString()} <br> Player Time: ${playerTime}`;
});