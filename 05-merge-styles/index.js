const fs = require("fs");
const path = require("path");

mergeStyles("styles", path.join("project-dist", "bundle.css"));

async function mergeStyles(src, dest) {
  const inputPath = path.resolve(__dirname, src);
  const outputPath = path.resolve(__dirname, dest);
  try {
    const bundle = fs.createWriteStream(outputPath);
    const styles = await fs.promises.readdir(inputPath, {
      withFileTypes: true,
    });

    for (const entity of styles) {
      if (entity.isFile()) {
        const filePath = path.join(inputPath, entity.name);
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

    console.log("Successfully bundled");
  } catch (err) {
    console.error(err);
  }
}
