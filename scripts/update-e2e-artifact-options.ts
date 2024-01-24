#!yarn ts-node

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import fetch from 'node-fetch';

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_API_USERNAME || '';
const BROWSERSTACK_PASSWORD = process.env.BROWSERSTACK_API_PASSWORD || '';

const BROWSERSTACK_API_BASE_URL =
  'https://api-cloud.browserstack.com/app-automate';

const E2E_WORKFLOW_PATH = '.github/workflows/e2e-tests.yml';

function writeFile(data: any) {
  const yamlStr = yaml.dump(data);
  fs.writeFileSync('tmp.yml', yamlStr, 'utf8');
}

async function getUploadedVersions() {
  try {
    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${BROWSERSTACK_USERNAME}:${BROWSERSTACK_PASSWORD}`,
        ).toString('base64')}`,
      },
    };

    const response = await fetch(
      `${BROWSERSTACK_API_BASE_URL}/recent_apps`,
      requestOptions,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching uploaded apps on browserstack');
    throw error;
  }
}

async function main() {
  const e2eWorkflow = fs.readFileSync(E2E_WORKFLOW_PATH, 'utf8');
  const e2eWorkflowParsedData: any = yaml.load(e2eWorkflow);

  // Resetting the options array for each of the IPA and APK needed for e2e
  e2eWorkflowParsedData.on.workflow_dispatch.inputs.rn_test_app_path_ios.options =
    [];

  e2eWorkflowParsedData.on.workflow_dispatch.inputs.rn_test_app_path_android.options =
    [];

  e2eWorkflowParsedData.on.workflow_dispatch.inputs.wallet_app_path_ios.options =
    [];

  e2eWorkflowParsedData.on.workflow_dispatch.inputs.wallet_app_path_android.options =
    [];

  getUploadedVersions()
    .then((jsonResponse) => {
      const MMMMiOS = jsonResponse
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('SDK-'))
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('.ipa'))
        .map((uploadedApp: any) => uploadedApp.app_name);

      e2eWorkflowParsedData.on.workflow_dispatch.inputs.wallet_app_path_ios.options =
        MMMMiOS.length > 0 ? MMMMiOS : ['No iOS Wallet has been uploaded yet'];

      const MMMMAndroid = jsonResponse
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('SDK_'))
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('.apk'))
        .map((uploadedApp: any) => uploadedApp.app_name);

      e2eWorkflowParsedData.on.workflow_dispatch.inputs.wallet_app_path_android.options =
        MMMMAndroid.length > 0
          ? MMMMAndroid
          : ['No Android Wallet has been uploaded yet'];

      const RNiOS = jsonResponse
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('SDK_RN_'))
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('.ipa'))
        .map((uploadedApp: any) => uploadedApp.app_name);

      e2eWorkflowParsedData.on.workflow_dispatch.inputs.rn_test_app_path_ios.options =
        RNiOS.length > 0 ? RNiOS : ['No iOS RN apps uploaded yet'];

      const RNAndroid = jsonResponse
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('SDK_RN_'))
        .filter((uploadedApp: any) => uploadedApp.app_name.includes('.apk'))
        .map((uploadedApp: any) => uploadedApp.app_name);

      e2eWorkflowParsedData.on.workflow_dispatch.inputs.rn_test_app_path_android.options =
        RNAndroid.length > 0 ? RNAndroid : ['No Android RN apps uploaded yet'];
    })
    .then(() => {
      writeFile(e2eWorkflowParsedData);
    })
    .catch((error) => console.error('Error:', error));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
