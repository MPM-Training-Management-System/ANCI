import { app, BrowserWindow } from "electron";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
     autoHideMenuBar: true,
  });

  win.loadURL("http://localhost:3001");
}

app.whenReady().then(() => {
  createWindow();
});