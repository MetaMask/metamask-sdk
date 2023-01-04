import { config } from './wdio.conf';

//
// ======
// Appium
// ======
//
config.services = (config.services ? config.services : []).concat([
  [
    'appium',
    {
      // This will use the globally installed version of Appium
      command: 'appium',
      args: {
        // This is needed to tell Appium that we can execute local ADB commands
        // and to automatically download the latest version of ChromeDriver
        relaxedSecurity: true,
        address: 'localhost',
        port: 4723,
        // Write the Appium logs to a file in the root of the directory
        log: './appium.log',
      },
    },
  ],
]);
//
// =====================
// Server Configurations
// =====================
//
config.port = 4723;
config.path = '/wd/hub';

export default config;
