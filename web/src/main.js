const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let win1, win2, bigDisplay, smallDisplay;

function createWindows() {
  const displays = screen.getAllDisplays();
  if (displays.length < 2) {
    console.log('Need at least two monitors');
    app.quit();
    return;
  }

  // checks the width of the displays to determine which is the big one
  if (displays[0].bounds.width > displays[1].bounds.width) {
    bigDisplay = displays[0];
    smallDisplay = displays[1];
  } else {
    bigDisplay = displays[1];
    smallDisplay = displays[0];
  }

  
  win1 = new BrowserWindow({
    x: smallDisplay.bounds.x,
    y: smallDisplay.bounds.y,
    width: smallDisplay.bounds.width,
    height: smallDisplay.bounds.height,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const handleSelectSerialPort = (event, portList, webContents, callback) => {
    console.log('select-serial-port FIRED WITH', portList);

    event.preventDefault()
    const arduino = portList.find(port => port.displayName && port.displayName.toLowerCase().includes('arduino'))
    if (arduino) {
      callback(arduino.portId)
    } else {
      callback('') //Could not find any matching devices
    }
  };

  win1.webContents.session.on('select-serial-port', handleSelectSerialPort);

  win1.on('close', () => {
    win1.webContents.session.removeListener('select-serial-port', handleSelectSerialPort);
  });

  win1.loadFile('src/index.html');
  // win1.webContents.openDevTools();

  // Create second window on the second display
  win2 = new BrowserWindow({
    x: bigDisplay.bounds.x,
    y: bigDisplay.bounds.y,
    width: bigDisplay.bounds.width,
    height: bigDisplay.bounds.height,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win2.loadFile('src/finish.html');
  // win2.webContents.openDevTools();

  
  // console.log('win1', win1.webContents.id);

  ipcMain.on('finish', (event, ...args) => {
    win2.webContents.send('finish', args);
    console.log('Received message:', args);
    // win2.console.log('finish event ');
  });

}

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});


