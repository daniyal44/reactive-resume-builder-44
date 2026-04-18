const fs = require("fs");
const path = require("path");

function searchForUnhandled(dir) {
  let list;
  try {
    list = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }

  for (const dirent of list) {
    if (dirent.name === "node_modules") continue;

    const fullPath = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      searchForUnhandled(fullPath);
    } else if (dirent.isFile() && [".js", ".mjs", ".cjs", ".ts"].includes(path.extname(dirent.name))) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        if (
          content.includes('"unhandled": true') ||
          content.includes("unhandled: true") ||
          content.includes("unhandled:true")
        ) {
          console.log("Found in", fullPath);
        }
      } catch (e) {
        // skip
      }
    }
  }
}

console.log("Searching node_modules...");
searchForUnhandled("node_modules");
console.log("Searching src...");
searchForUnhandled("src");
console.log("Done.");
