
const { app, BrowserWindow, Menu, dialog } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

let mainWindow = null;
let adminServer = null;
let isQuitting = false;
let startupInProgress = false;
let serverReady = false;
let startupFailureShown = false;

const PORT = 3002;
const HOST = "localhost";
const ADMIN_URL = `http://${HOST}:${PORT}`;

const STARTUP_TIMEOUT = 60000;
const REQUEST_TIMEOUT = 3000;
const RETRY_INTERVAL = 500;
const MAX_PORT_CHECKS = 5;

function log(...args) {
  console.log("[ANCI]", new Date().toISOString(), ...args);
}

function getServerPath() {
  const base = app.isPackaged
    ? path.join(process.resourcesPath, "admin-server")
    : path.join(__dirname, "..", "resources", "admin-server");

  return path.join(base, "apps", "admin", "server.js");
}

function getNodePath() {
  if (app.isPackaged) {
    return path.join(
      process.resourcesPath,
      "admin-server",
      "runtime",
      "node.exe"
    );
  }

  return process.execPath;
}

function getServerDirectory() {
  return path.dirname(getServerPath());
}

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      const status = response.statusCode || 0;
      response.resume();

      resolve({
        status,
        ok: status >= 200 && status < 500,
      });
    });

    request.setTimeout(REQUEST_TIMEOUT, () => {
      request.destroy(new Error("HTTP request timed out."));
    });

    request.on("error", reject);
  });
}

async function isAdminServerReady() {
  try {
    const result = await checkUrl(ADMIN_URL);

    if (result.ok) {
      log("Existing Admin server detected.", {
        url: ADMIN_URL,
        status: result.status,
      });

      return true;
    }
  } catch {
    // No server response yet.
  }

  return false;
}

function startAdminServer() {
  const serverPath = getServerPath();
  const serverDirectory = getServerDirectory();
  const nodePath = getNodePath();

  log("Preparing Admin server.");
  log("Packaged:", app.isPackaged);
  log("Resources:", process.resourcesPath);
  log("Node executable:", nodePath);
  log("Server path:", serverPath);
  log("Server directory:", serverDirectory);
  log("Admin URL:", ADMIN_URL);

  if (!fs.existsSync(nodePath)) {
    throw new Error(
      `Node.js executable was not found:\n${nodePath}`
    );
  }

  if (!fs.existsSync(serverPath)) {
    throw new Error(
      `Next.js server.js was not found:\n${serverPath}`
    );
  }

  const child = spawn(nodePath, [serverPath], {
    cwd: serverDirectory,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(PORT),
      HOSTNAME: HOST,
    },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  adminServer = child;

  child.stdout.on("data", (data) => {
    log("[Admin stdout]", data.toString().trimEnd());
  });

  child.stderr.on("data", (data) => {
    log("[Admin stderr]", data.toString().trimEnd());
  });

  child.on("error", (error) => {
    log("[Admin process error]", {
      message: error.message,
      stack: error.stack,
      nodePath,
      serverPath,
    });
  });

  child.on("exit", (code, signal) => {
    log("[Admin process exit]", {
      code,
      signal,
      pid: child.pid,
      killed: child.killed,
      serverPath,
      nodePath,
      serverDirectory,
      port: PORT,
      url: ADMIN_URL,
    });

    if (adminServer === child) {
      adminServer = null;
    }

    if (!isQuitting && !serverReady) {
      log("Admin process exited before server startup completed.");
    }
  });

  log("Admin server launch requested.", {
    pid: child.pid,
    nodePath,
    serverPath,
  });

  return child;
}

function waitForServer(child, timeoutMs = STARTUP_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    let lastError = "No response received.";

    async function check() {
      if (isQuitting) {
        reject(new Error("Application is closing."));
        return;
      }

      if (child.exitCode !== null || child.signalCode !== null) {
        reject(
          new Error(
            "Admin server exited before becoming ready.\n" +
              `Exit code: ${child.exitCode}\n` +
              `Signal: ${child.signalCode}\n` +
              `Last error: ${lastError}`
          )
        );

        return;
      }

      try {
        const result = await checkUrl(ADMIN_URL);

        if (result.ok) {
          serverReady = true;

          log("Admin server is ready.", {
            url: ADMIN_URL,
            status: result.status,
            elapsedMs: Date.now() - startedAt,
          });

          resolve();
          return;
        }

        lastError = `Unexpected HTTP status ${result.status}`;
      } catch (error) {
        lastError = error.message;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(
          new Error(
            `Admin server did not become ready within ${
              timeoutMs / 1000
            } seconds.\n` +
              `URL: ${ADMIN_URL}\n` +
              `Last error: ${lastError}`
          )
        );

        return;
      }

      setTimeout(check, RETRY_INTERVAL);
    }

    check();
  });
}

function openConsoleDevTools(window) {
  if (!window || window.isDestroyed()) {
    return;
  }

  const contents = window.webContents;

  contents.once("devtools-opened", () => {
    log("Developer Tools opened.");

    const devTools = contents.devToolsWebContents;

    if (!devTools || devTools.isDestroyed()) {
      return;
    }

    const script = `
      (() => {
        const selectConsole = () => {
          const tabs = [
            ...document.querySelectorAll(
              '.tabbed-pane .tab, [role="tab"]'
            )
          ];

          const consoleTab = tabs.find(
            (tab) => tab.textContent.trim() === "Console"
          );

          if (consoleTab) {
            consoleTab.click();
            return true;
          }

          return false;
        };

        selectConsole();
        setTimeout(selectConsole, 300);
        setTimeout(selectConsole, 1000);
      })();
    `;

    devTools.executeJavaScript(script).catch((error) => {
      log("Unable to select Console tab automatically:", error.message);
    });
  });

  contents.openDevTools({
    mode: "detach",
  });
}

async function showStartupError(error) {
  log("Startup failed:", error.stack || error.message);

  if (isQuitting || startupFailureShown) {
    return;
  }

  startupFailureShown = true;

  await dialog.showMessageBox({
    type: "error",
    title: "ANCI Startup Error",
    message: "Unable to start ANCI Admin.",
    detail: error.message,
    buttons: ["Close"],
  });
}

async function createWindow() {
  if (startupInProgress || isQuitting) {
    return;
  }

  startupInProgress = true;
  serverReady = false;
  startupFailureShown = false;

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    icon: path.join(__dirname, "../assets/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
    },
  });

  const window = mainWindow;

  window.once("ready-to-show", () => {
    if (!window.isDestroyed()) {
      window.show();
    }
  });

  window.webContents.on(
    "did-fail-load",
    (_event, code, description, url, isMainFrame) => {
      log("Page load failed:", {
        code,
        description,
        url,
        isMainFrame,
      });
    }
  );

  window.webContents.on("did-finish-load", () => {
    log("Page finished loading:", window.webContents.getURL());
  });

  window.webContents.on("render-process-gone", (_event, details) => {
    log("Renderer process terminated:", details);
  });

  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });

  try {
    if (app.isPackaged) {
      // Avoid starting another server if the port is already responding.
      const existingServer = await isAdminServerReady();

      if (!existingServer) {
        const child = startAdminServer();
        await waitForServer(child);
      } else {
        serverReady = true;
      }
    } else {
      log("Development mode. Expecting Admin server at:", ADMIN_URL);

      const startedAt = Date.now();

      while (!(await isAdminServerReady())) {
        if (Date.now() - startedAt >= STARTUP_TIMEOUT) {
          throw new Error(
            `Development Admin server was not found.\nURL: ${ADMIN_URL}`
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_INTERVAL)
        );
      }

      serverReady = true;
    }

    if (isQuitting || window.isDestroyed()) {
      return;
    }

    // Load Next.js Admin after the server is ready.
    await window.loadURL(ADMIN_URL);

    log("ANCI Admin loaded successfully:", ADMIN_URL);

    // Open DevTools automatically for debugging.
    openConsoleDevTools(window);
  } catch (error) {
    await showStartupError(error);

    if (!window.isDestroyed()) {
      window.destroy();
    }

    if (mainWindow === window) {
      mainWindow = null;
    }
  } finally {
    startupInProgress = false;
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  log("Application ready.");
  log("Version:", app.getVersion());
  log("Packaged:", app.isPackaged);
  log("Resources:", process.resourcesPath);
  log("Executable:", app.getPath("exe"));
  log("User data:", app.getPath("userData"));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  isQuitting = true;

  if (adminServer) {
    const child = adminServer;
    adminServer = null;

    if (child.exitCode === null && !child.killed) {
      log("Stopping bundled Admin server.", child.pid);
      child.kill();
    }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
