import { MetaMaskSDK } from 'metamask-sdk';
import { SDKOptions } from 'metamask-sdk';
import { AppMetadata } from 'metamask-sdk';

const appMetadata: AppMetadata = {
    // Your app metadata here
};

const sdkOptions: SDKOptions = {
    infuraAPIKey: '1066fc13c6b64c54bcc9566e5b04db22',
    readonlyRPCMap: {
        '0x1': 'https://www.testrpc.com'
    }
};

const metamaskSDK = MetaMaskSDK.shared(appMetadata, {
    transport: 'deeplinking',
    dappScheme: 'dubdapp',
    sdkOptions: sdkOptions
});
