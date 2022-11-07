const fs = require("fs");
const path = require("path");
const { Transform } = require("stream");

const projectDir = path.join(__dirname, "project-dist");
const assets = path.join(__dirname, "assets");
const styles = path.join(__dirname, "styles");
const componentsDir = path.join(__dirname, "components");

(async () => {
  try {
    await copyDir(assets, path.join(projectDir, "assets"));
    await mergeStyles(styles, path.join(projectDir, "style.css"));

    const template = fs.createReadStream(path.join(__dirname, "template.html"));

    const htmlBundle = fs.createWriteStream(
      path.join(projectDir, "index.html")
    );

    const replacement = new Transform({
      async transform(chunk, encoding, callback) {
        const replacements = chunk
          .toString()
          .match(/(?<=\{\{).+(?=\}\})/g)
          .map((componentName) => {
            const componentPath = path.join(
              componentsDir,
              componentName + ".html"
            );
            const stream = fs.createReadStream(componentPath);
            return new Promise((resolve) => {
              const chunks = [];
              stream.on("data", (data) => chunks.push(data));
              stream.on("end", () => {
                chunk = chunk
                  .toString()
                  .replace(`{{${componentName}}}`, chunks.join(""));
                resolve();
              });
            });
          });
        await Promise.all(replacements);
        callback(null, chunk);
      },
    });

    template.pipe(replacement).pipe(htmlBundle);
  } catch (err) {
    console.error(err);
  }
})();

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
            stream.on("end", () => bundle.write("\n", resolve));
          });
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function copyDir(src, dest) {
  try {
    await fs.promises.rm(dest, { recursive: true, force: true });
    await fs.promises.mkdir(dest, { recursive: true });
    const srcDir = await fs.promises.readdir(src, {
      withFileTypes: true,
    });

    for (const entity of srcDir)
      if (entity.isFile()) {
        const srcFilePath = path.join(src, entity.name);
        const destFilePath = path.join(dest, entity.name);
        await fs.promises.copyFile(srcFilePath, destFilePath);
      } else {
        copyDir(path.join(src, entity.name), path.join(dest, entity.name));
      }
  } catch (err) {
    console.error(err);
  }
}
