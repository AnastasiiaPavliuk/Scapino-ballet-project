// In your finish.js file, you can use electronAPI to send and receive messages

const { ipcRenderer } = require('electron');

const $distanceOutput = document.querySelector(".distance-output");

console.log("finish.js");

ipcRenderer.on('receive-data-from-main', (event, data) => {
    document.getElementById('data-display').innerText = JSON.stringify(data, null, 2);
});

// Listen for 'receive-data-in-win2' event
electronAPI.on('display-finish', (data) => {
    console.log("Data received in window 2:", data);

    $distanceOutput.innerHTML = `
        Finish Distance: ${data.finishDistance} cm<br>
        Presence Distance: ${data.presenceDistance} cm<br>
        Arm Distance: ${data.armDistance} cm<br>
        Player is: ${data.playerIs}<br>
    `;
});
