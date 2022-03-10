import Bowser from 'bowser';

export default class SDK {
  constructor() {
    console.log('HERE', Bowser.parse(navigator.userAgent));
  }
}
