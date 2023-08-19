const fs = require("node:fs/promises");
const path = require("node:path");

postpack().catch(console.error);
async function postpack() {
  const readme = path.join(__dirname, "..", "README.md");
  await fs.rm(readme);
}
