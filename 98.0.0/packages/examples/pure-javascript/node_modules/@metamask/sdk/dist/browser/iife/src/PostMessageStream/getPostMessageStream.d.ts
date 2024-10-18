import { CommunicationLayerPreference } from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';
import { ProviderConstants } from '../constants';
import { RemoteConnection } from '../services/RemoteConnection';
import { PostMessageStream } from './PostMessageStream';
export interface GetPostMessageStreamProps {
    name: ProviderConstants;
    target: ProviderConstants;
    remoteConnection?: RemoteConnection;
    platformManager: PlatformManager;
    communicationLayerPreference: CommunicationLayerPreference;
}
export declare const getPostMessageStream: ({ name, remoteConnection, }: GetPostMessageStreamProps) => PostMessageStream;
//# sourceMappingURL=getPostMessageStream.d.ts.map