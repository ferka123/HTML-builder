const fs = require("fs/promises");
const path = require("path");

const dirPath = path.resolve(__dirname, "secret-folder");

(async () => {
  try {
    const ents = await fs.readdir(dirPath, { withFileTypes: true });
    for (const ent of ents)
      if (ent.isFile()) {
        const filePath = path.join(dirPath, ent.name);
        const file = path.parse(filePath);
        const fileStat = await fs.stat(filePath);
        console.log(
          `${file.name} - ${file.ext.slice(1)} - ${
            Math.round(fileStat.size / 10.24) / 100
          } kb`
        );
      }
  } catch (err) {
    console.error(err);
  }
})();
