import { resolve } from 'path';
import type { Options } from '@wdio/types';
import { register } from 'ts-node';
import moduleAlias from 'module-alias';
import * as dotenv from 'dotenv';

// const allure = require('allure-commandline');

dotenv.config({ path: resolve(process.cwd(), '.dapps.env') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Register ts-node
register({
  project: 'tsconfig.json',
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

moduleAlias.addAliases({
  '@fixtures': resolve(__dirname, '../../src/fixtures'),
  '@util': resolve(__dirname, '../../src/util'),
  '@screens': resolve(__dirname, '../../src/screens'),
  '@specs': resolve(__dirname, '../../test/specs'),
});

export const config: Options.Testrunner = {
  runner: 'local',
  capabilities: [],

  services: [],
  // specs: ['../../specs/*.spec.ts'],
  suites: {
    metamask_connector: ['../../specs/metamask-connector/*.spec.ts'],
    // Deprecated test suites
    // js_sdk: ['../../specs/js_sdk.spec.ts'],
    // android_sdk: ['../../specs/android_sdk.spec.ts'],
    // Development suite that uses fixtures
    fixture_reference: ['../../specs/fixture_reference.ts'],
  },
  mochaOpts: {
    timeout: 360000,
  },
  exclude: [
    // 'path/to/excluded/files'
  ],
  logLevel: 'debug',

  bail: 0,

  baseUrl: '',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,

  framework: 'mocha',

  // outputDir: 'logs',

  maxInstances: 1,

  reporters: ['spec', ['allure', { outputDir: 'allure-results' }]],

  /*
  // If you are using Cucumber you need to specify the location of your step definitions.
  onComplete() {
    const reportError = new Error('Could not generate Allure report');
    const generation = allure(['generate', 'allure-results', '--clean']);
    return new Promise<void>((resolve, reject) => {
      const generationTimeout = setTimeout(() => reject(reportError), 5000);

      generation.on('exit', (exitCode: number) => {
        clearTimeout(generationTimeout);

        if (exitCode !== 0) {
          return reject(reportError);
        }

        console.log('Allure report successfully generated');
        return resolve();
      });
    });
  },*/
};
