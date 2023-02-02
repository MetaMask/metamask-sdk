This project is used for development purpose and validate the integration of the different packages.

- Test @metamask/sdk-communication-layer with `yarn start`
- Test @metamask/sdk-communication-layer ECIES encryption with `TARGET=ecies yarn start`
- Test @metamask/sdk with `TARGET=sdk yarn start`

## Custom communication server

In case you want to use your local socket io communication server, you need to first start it from
`packages/sdk-socket-server` with `yarn debug`.
You can then adjust `communicationServerUrl` parameter of the SDK.
