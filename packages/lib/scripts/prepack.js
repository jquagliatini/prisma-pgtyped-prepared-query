const cp = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");

prepack().catch(console.error);
async function prepack() {
  const readmeSrc = path.join(__dirname, "..", "..", "..", "README.md");
  const readmeDest = path.join(__dirname, "..", "README.md");

  await fs.copyFile(readmeSrc, readmeDest);
  await cp.execSync("pnpm run build", { cwd: path.join(__dirname, "..") });
}
