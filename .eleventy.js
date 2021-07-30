// Pre-step is concating the client/src/js files
const fs = require("fs");
const path = require("path");

function findInDir(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.lstatSync(filePath);

    if (fileStat.isDirectory()) {
      findInDir(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// js concatnation
const JS_DEST = path.resolve("client/dist/js");
const JS_FILE = path.join(JS_DEST, "main.js");
fs.mkdirSync(JS_DEST, {
  recursive: true,
});
if (fs.existsSync(JS_FILE)) fs.rmSync(JS_FILE);
let sourceJsFiles = findInDir("./client/src/js/", /\.js$/);
console.log(
  `Joining src/js/*.js (${sourceJsFiles.length} files) into dist/js/main.js`
);
sourceJsFiles.forEach((filename) => {
  fs.appendFileSync(JS_FILE, fs.readFileSync(filename));
});

// 11ty configuration
const dev = (global.dev = process.env.ELEVENTY_ENV === "development");
// deps
const CleanCSS = require("clean-css");

module.exports = function (eleventyConfig) {
  // CSS Minifier
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Static files passthru
  eleventyConfig.addPassthroughCopy({
    "client/src/static": ".",
  });

  return {
    dir: {
      input: "client/src",
      output: "client/dist",
    },
  };
};
