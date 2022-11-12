const fs = require("fs/promises");
const path = require("path");

const src = path.resolve(__dirname, "files");
const dest = path.resolve(__dirname, "files-copy");
copyDir(src, dest);

async function copyDir(src, dest) {
  try {
    await fs.rm(dest, { recursive: true, force: true });
    await fs.mkdir(dest, { recursive: true });
    const srcDir = await fs.readdir(src, {
      withFileTypes: true,
    });

    for (const entity of srcDir)
      if (entity.isFile()) {
        const srcFilePath = path.join(src, entity.name);
        const destFilePath = path.join(dest, entity.name);
        await fs.copyFile(srcFilePath, destFilePath);
      } else {
        await copyDir(path.join(src, entity.name), path.join(dest, entity.name));
      }
  } catch (err) {
    console.error(err);
  }
}