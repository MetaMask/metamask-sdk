# E2E SDK Automation

### Node version

`nvm use 20`

### Setup:

`yarn setup`

### Set a test SRP:

`export SRP=TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST`

## Create an iOS simulator and Android emulator


### Complete your platform related env files:
`cp .ios.env.example .ios.env`

`cp .android.env.example .android.env`

.dapps.env:
```
DEVNEXT_DAPP_URL=
WAGMI_TEST_DAPP_URL=
```

# iOS
### Create an iOS simulator

### Run tests on iOS:

`yarn test:ios:jssdk:e2e:local`

### Run tests on Android:

`yarn test:android:jssdk:e2e:local`

#### Currently setup to run locally
