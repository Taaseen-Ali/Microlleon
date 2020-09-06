const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// Init window
let win;

function createWindow() {
    // Create browser window
    win = new BrowserWindow({ width: 800, height: 600, webPreferences: {nodeIntegration: true}});

    win.loadURL(
	url.format({
	    pathname: path.join(__dirname, './index.html'),
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

var link;

app.on('open-url', function (event, data) {
    event.preventDefault();
    link = data;
});


app.setAsDefaultProtocolClient('microlleon');

// Export so you can access it from the renderer thread
module.exports.getLink = () => link;
