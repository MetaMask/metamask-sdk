const fs = require('fs');
const path = require('path');

const findPackageJson = (dir) => {
  const packageJsonPath = path.join(dir, 'package.json');
  // eslint-disable-next-line node/no-sync
  if (fs.existsSync(packageJsonPath)) {
    return dir;
  }
  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    return null;
  } // Reached the root directory
  return findPackageJson(parentDir);
};

module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    return filenames.map((filename) => {
      // Find the nearest package.json file to the changed file
      const packageDir = findPackageJson(path.dirname(filename));

      console.log(`packageDir: ${packageDir}`, filename);
      // Change to the package directory and run the commands
      return `cd ${packageDir} && eslint --fix ${filename} && prettier --write ${filename}`;
    });
  },
};
