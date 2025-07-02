
export type SDKEvents = {
  initialized: [
    evt: {
      chainId: string;
      isConnected: boolean;
      isMetaMask: boolean;
      selectedAddress: string | null | undefined;
      networkVersion: string | null | undefined;
    },
  ];
  display_uri: [evt: string];
  provider_update: [evt: 'terminate' | 'extension' | 'initialized'];
  connection_status: [
    // TODO: figure our something better than unknown
    evt: unknown,
  ];
  service_status: [
    // TODO: figure our something better than unknown
    evt: unknown,
  ];
  connect_with_Response: [
    // TODO: figure our something better than unknown
    evt: unknown,
  ];
};