const fs = require("fs");
const path = require("path");
const { Transform } = require("stream");

const copyDir = require("../04-copy-directory");
const mergeStyles = require("../05-merge-styles");

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
                chunk = chunk.toString().replace(`{{${componentName}}}`, chunks.join(""));
                resolve();
              });
            });
          });
        await Promise.all(replacements)
        callback(null, chunk);
      },
    });

    template.pipe(replacement).pipe(htmlBundle);
  } catch (err) {
    console.error(err);
  }
})();
