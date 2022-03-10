import Bowser from 'bowser';

export default class MetaMaskSDK {
  constructor() {
    console.log('HERE', Bowser.parse(navigator.userAgent));
  }
}
