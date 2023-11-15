const path = require('path');

module.exports = (request, options) => {
  if (request === 'react' || request === 'react-dom' || request === 'react-test-renderer' || request === '@testing-library/react') {
    console.log(`${request} ==> `, path.resolve(__dirname, '../devreact/node_modules/', request))
    // Adjust the path to point to the location where react and react-dom are installed
    const packagePath = path.resolve(__dirname, '../devreact/node_modules/', request);
    const packageJson = require(path.join(packagePath, 'package.json'));
    return path.join(packagePath, packageJson.main);
  } else if (request === 'react-dom/test-utils') {
    console.log(`${request} ==> `, path.resolve(__dirname, '../devreact/node_modules/react-dom/test-utils'))
    return path.resolve(__dirname, '../devreact/node_modules/react-dom/test-utils.js');
  }

  // For other packages, use the default resolution
  return options.defaultResolver(request, options);
};
