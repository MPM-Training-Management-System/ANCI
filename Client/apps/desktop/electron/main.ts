import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
     autoHideMenuBar: true,
     icon: path.join(__dirname, "../assets/images/ANCILOGO.png"),
  });

  win.loadURL("http://localhost:3001");
}

app.whenReady().then(() => {
  createWindow();
});