const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let win1, win2;

function createWindows() {
  const displays = screen.getAllDisplays();
  if (displays.length < 2) {
    console.log('Need at least two monitors');
    app.quit();
    return;
  }
  
  win1 = new BrowserWindow({
    x: displays[1].bounds.x + 50,
    y: displays[1].bounds.y + 50,
    width: 1920,
    height: 1080,
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
  //win1.webContents.openDevTools();

  // Create second window on the second display
  win2 = new BrowserWindow({
    x: displays[0].bounds.x + 50,
    y: displays[0].bounds.y + 50,
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win2.loadFile('src/finish.html');
  //win2.webContents.openDevTools();

  
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


