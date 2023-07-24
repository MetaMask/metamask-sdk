# E2E SDK Automation

### Node version
`nvm use 16`

### Setup:

`yarn setup`

### Set a test SRP:
`export SRP=TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST`

### Env files needed:

.ios.env:
- BUNDLE_ID=
- DEVICE_NAME=
- PLATFORM_VERSION=
- APP_PATH=
- AUTOMATION_NAME=
- DEVICE_UDID=

.android.env:
- BUNDLE_ID=
- DEVICE_NAME=
- PLATFORM_VERSION=
- APP_PATH=
- AUTOMATION_NAME=
- APP_ACTIVITY=

.dapps.env:
- REACT_DAPP_URL=

.env:
- BROWSERSTACK_USERNAME=
- BROWSERSTACK_ACCESS_KEY=

### Run tests:
`yarn test:ios`

#### Currently setup to run locally
