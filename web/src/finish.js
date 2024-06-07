window.electronAPI.on('display-finish', (message) => {
    document.querySelector('.distance-output').innerText = message;
});
