const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "text.txt");

const stream = fs.createWriteStream(filePath);

process.stdin.on("data", (data) => {
  if (data.toString().trim() === "exit") exitHandler();
  stream.write(data);
});

process.on("SIGINT", exitHandler);

process.stdout.write("Hello! Please enter your text below:\n");

function exitHandler() {
  process.stdout.write("Bye!\n");
  process.exit();
}
