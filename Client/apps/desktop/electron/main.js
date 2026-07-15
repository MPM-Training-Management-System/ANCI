const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, "assets", "favicon.ico"),
    autoHideMenuBar: true,
  });

  win.loadURL("https://anci-tms.vercel.app/login");
}

app.whenReady().then(createWindow);