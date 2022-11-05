const fs = require("fs/promises");
const path = require("path");

async function copyDir(src, dest) {
  try {
    const destDirPath = path.resolve(__dirname, dest);
    await fs.rm(destDirPath, { recursive: true, force: true });
    const destDir = await fs.mkdir(destDirPath, { recursive: true });
    const srcDirPath = path.resolve(__dirname, src);
    const srcDir = await fs.readdir(srcDirPath, {
      withFileTypes: true,
    });

    for (const entity of srcDir)
      if (entity.isFile()) {
        const srcFilePath = path.join(srcDirPath, entity.name);
        const destFilePath = path.join(destDirPath, entity.name);
        await fs.copyFile(srcFilePath, destFilePath);
      } else {
        copyDir(path.join(src, entity.name), path.join(dest, entity.name));
      }
  } catch (err) {
    console.error(err);
  }
}

copyDir("files", "files-copy");
