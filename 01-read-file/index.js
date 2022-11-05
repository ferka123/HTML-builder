const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "text.txt");

const stream = fs.createReadStream(filePath, "utf-8");
stream.pipe(process.stdout);
