const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// Init window
let win;

function createWindow() {
  // Create browser window
  win = new BrowserWindow({ width: 800, height: 600 });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file',
      slashes: true,
    })
  );

  //Open devtools
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
