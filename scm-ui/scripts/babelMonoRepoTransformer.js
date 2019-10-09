/**
 * Read and use .babelrc from packages
 */
const path = require("path");
const { createTransformer } = require("babel-jest");

const packagePath = path.resolve(__dirname, "../");
const packageGlob = path.join(packagePath, "*");

module.exports = createTransformer({
  babelrcRoots: packageGlob
});
