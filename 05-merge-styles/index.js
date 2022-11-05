const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "styles");
const dest = path.resolve(__dirname, path.join("project-dist", "bundle.css"));
mergeStyles(src, dest);

async function mergeStyles(src, dest) {
  try {
    const bundle = fs.createWriteStream(dest);
    const styles = await fs.promises.readdir(src, {
      withFileTypes: true,
    });

    for (const entity of styles) {
      if (entity.isFile()) {
        const filePath = path.join(src, entity.name);
        const file = path.parse(filePath);
        if (file.ext === ".css") {
          await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath);
            stream.pipe(bundle, { end: false });
            stream.on("end", resolve);
          });
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = mergeStyles;
