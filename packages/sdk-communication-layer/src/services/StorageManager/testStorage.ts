import { RemoteCommunicationState } from '../../RemoteCommunication';

export async function testStorage(state: RemoteCommunicationState) {
  const res = await state.storageManager?.getPersistedChannelConfig(
    state.channelId ?? '',
  );
  console.debug(`RemoteCommunication.testStorage() res`, res);
}
