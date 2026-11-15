
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");

const desktopDir = path.resolve(__dirname, "..");
const adminDir = path.resolve(desktopDir, "../admin");
const standaloneDir = path.join(adminDir, ".next", "standalone");
const outputDir = path.join(desktopDir, "resources", "admin-server");

const nodeSource = process.execPath;
const nodeRuntimeDir = path.join(outputDir, "runtime");
const nodeDestination = path.join(nodeRuntimeDir, "node.exe");

function findServer(dir) {
  if (!fs.existsSync(dir)) return null;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name === "server.js") {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const found = findServer(fullPath);
      if (found) return found;
    }
  }

  return null;
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    throw new Error(`Source directory does not exist: ${source}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, {
    recursive: true,
    dereference: true,
    force: true,
  });
}

if (process.platform !== "win32" || process.arch !== "x64") {
  throw new Error(
    `Build this Windows installer using 64-bit Node.js. ` +
      `Current platform: ${process.platform}, architecture: ${process.arch}`
  );
}

if (!fs.existsSync(nodeSource)) {
  throw new Error(`Node.js executable not found: ${nodeSource}`);
}

const serverPath = findServer(standaloneDir);

if (!serverPath) {
  throw new Error(
    `No server.js found in ${standaloneDir}. ` +
      "Check next.config.ts and ensure output: 'standalone' is enabled."
  );
}

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}

fs.mkdirSync(outputDir, { recursive: true });

// Copy the complete Next.js standalone output.
fs.cpSync(standaloneDir, outputDir, {
  recursive: true,
  dereference: true,
});

const relativeServer = path.relative(standaloneDir, serverPath);
const relativeServerDir = path.dirname(relativeServer);
const packagedAdminDir = path.join(outputDir, relativeServerDir);

/**
 * pnpm standalone output may keep package aliases inside:
 * node_modules/.pnpm/node_modules
 *
 * Make those aliases available to the packaged Next.js server.
 */
const pnpmAliasesDir = path.join(
  outputDir,
  "node_modules",
  ".pnpm",
  "node_modules"
);

const packagedNodeModules = path.join(
  packagedAdminDir,
  "node_modules"
);

if (fs.existsSync(pnpmAliasesDir)) {
  fs.mkdirSync(packagedNodeModules, { recursive: true });

  for (const entry of fs.readdirSync(pnpmAliasesDir, {
    withFileTypes: true,
  })) {
    const source = path.join(pnpmAliasesDir, entry.name);
    const destination = path.join(packagedNodeModules, entry.name);

    // Preserve existing valid packages; add missing aliases.
    if (fs.existsSync(destination)) continue;

    // Copy scoped packages such as @next/env and @swc/helpers.
    if (entry.isDirectory() && entry.name.startsWith("@")) {
      fs.mkdirSync(destination, { recursive: true });

      for (const scopedEntry of fs.readdirSync(source, {
        withFileTypes: true,
      })) {
        const scopedSource = path.join(source, scopedEntry.name);
        const scopedDestination = path.join(
          destination,
          scopedEntry.name
        );

        if (fs.existsSync(scopedDestination)) continue;

        fs.cpSync(scopedSource, scopedDestination, {
          recursive: true,
          dereference: true,
          force: true,
        });
      }
    } else {
      fs.cpSync(source, destination, {
        recursive: true,
        dereference: true,
        force: true,
      });
    }
  }
}


// Explicitly include @swc/helpers in the standalone server.
// pnpm may store the actual package outside the admin app's node_modules.
const adminRequire = createRequire(path.join(adminDir, "package.json"));

let swcEntry;

try {
  swcEntry = adminRequire.resolve(
    "@swc/helpers/_/_interop_require_default"
  );
} catch (error) {
  throw new Error(
    "Cannot resolve @swc/helpers from the admin app. " +
      "Run pnpm install from the client workspace and verify the admin dependency.",
    { cause: error }
  );
}

// Resolved entry is normally:
// .../@swc/helpers/esm/_interop_require_default.js
const swcPackageDir = path.resolve(path.dirname(swcEntry), "..");
const swcPackageJson = path.join(swcPackageDir, "package.json");

if (!fs.existsSync(swcPackageJson)) {
  throw new Error(
    `Could not locate @swc/helpers package.json at ${swcPackageJson}`
  );
}

const swcDestination = path.join(
  packagedAdminDir,
  "node_modules",
  "@swc",
  "helpers"
);

copyDirectory(swcPackageDir, swcDestination);

const swcDestinationPackageJson = path.join(
  swcDestination,
  "package.json"
);

if (!fs.existsSync(swcDestinationPackageJson)) {
  throw new Error(
    `@swc/helpers was not copied correctly to ${swcDestination}`
  );
}

// Copy Next.js static assets.
const staticSource = path.join(adminDir, ".next", "static");
const staticDestination = path.join(
  packagedAdminDir,
  ".next",
  "static"
);

if (fs.existsSync(staticSource)) {
  fs.mkdirSync(staticDestination, { recursive: true });
  fs.cpSync(staticSource, staticDestination, {
    recursive: true,
    dereference: true,
  });
} else {
  console.warn("Warning: Next.js static directory was not found:", staticSource);
}

// Copy public assets.
const publicSource = path.join(adminDir, "public");
const publicDestination = path.join(packagedAdminDir, "public");

if (fs.existsSync(publicSource)) {
  fs.mkdirSync(publicDestination, { recursive: true });
  fs.cpSync(publicSource, publicDestination, {
    recursive: true,
    dereference: true,
  });
}

// Package the Node.js executable used during this build.
fs.mkdirSync(nodeRuntimeDir, { recursive: true });
fs.copyFileSync(nodeSource, nodeDestination);

if (!fs.existsSync(nodeDestination)) {
  throw new Error(`Failed to package Node.js runtime: ${nodeDestination}`);
}

console.log("Admin server prepared successfully.");
console.log("Server location:", relativeServer);
console.log("@swc/helpers source:", swcPackageDir);
console.log("@swc/helpers destination:", swcDestination);
console.log("Node.js source:", nodeSource);
console.log("Packaged Node.js:", nodeDestination);
console.log("Output directory:", outputDir);
