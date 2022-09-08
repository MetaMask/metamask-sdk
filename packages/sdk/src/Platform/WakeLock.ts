import { webm, mp4 } from './media';

// Detect iOS browsers < version 10
const oldIOS = () =>
  typeof navigator !== 'undefined' &&
  parseFloat(
    `${
      // eslint-disable-next-line require-unicode-regexp
      (/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(
        navigator.userAgent,
      ) || [0, ''])[1]
    }`
      .replace('undefined', '3_2')
      .replace('_', '.')
      .replace('_', ''),
  ) < 10 &&
  !window.MSStream;

// Detect native Wake Lock API support
const nativeWakeLock = () => 'wakeLock' in navigator;

class WakeLock {
  enabled: boolean;

  _wakeLock: any;

  noSleepTimer: any;

  noSleepVideo: HTMLVideoElement;

  private _eventsAdded = false;

  start() {
    this.enabled = false;
    if (nativeWakeLock() && !this._eventsAdded) {
      this._eventsAdded = true;
      this._wakeLock = null;
      const handleVisibilityChange = () => {
        if (this._wakeLock !== null && document.visibilityState === 'visible') {
          this.enable();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleVisibilityChange);
    } else if (oldIOS()) {
      this.noSleepTimer = null;
    } else {
      // Set up no sleep video element
      this.noSleepVideo = document.createElement('video');

      this.noSleepVideo.setAttribute(
        'title',
        'MetaMask SDK - Listening for responses',
      );
      this.noSleepVideo.setAttribute('playsinline', '');

      this._addSourceToVideo(this.noSleepVideo, 'webm', webm);
      this._addSourceToVideo(this.noSleepVideo, 'mp4', mp4);

      this.noSleepVideo.addEventListener('loadedmetadata', () => {
        if (this.noSleepVideo.duration <= 1) {
          // webm source
          this.noSleepVideo.setAttribute('loop', '');
        } else {
          // mp4 source
          this.noSleepVideo.addEventListener('timeupdate', () => {
            if (this.noSleepVideo.currentTime > 0.5) {
              this.noSleepVideo.currentTime = Math.random();
            }
          });
        }
      });
    }
  }

  _addSourceToVideo(element, type, dataURI) {
    const source = document.createElement('source');
    source.src = dataURI;
    source.type = `video/${type}`;
    element.appendChild(source);
  }

  get isEnabled() {
    return this.enabled;
  }

  enable() {
    if (this.enabled) {
      this.disable();
    }
    this.start();
    if (nativeWakeLock()) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return navigator.wakeLock
        .request('screen')
        .then((wakeLock) => {
          this._wakeLock = wakeLock;
          this.enabled = true;
          // console.log('Wake Lock active.');
          /* this._wakeLock.addEventListener('release', () => {
            // ToDo: Potentially emit an event for the page to observe since
            // Wake Lock releases happen when page visibility changes.
            // (https://web.dev/wakelock/#wake-lock-lifecycle)
            console.log('Wake Lock released.');
          });*/
        })
        .catch(() => {
          this.enabled = false;
          return false;
        });
    } else if (oldIOS()) {
      this.disable();
      /* console.warn(`
        NoSleep enabled for older iOS devices. This can interrupt
        active or long-running network requests from completing successfully.
        See https://github.com/richtr/NoSleep.js/issues/15 for more details.
      `);*/
      this.noSleepTimer = window.setInterval(() => {
        if (!document.hidden) {
          window.location.href = window.location.href.split('#')[0];
          window.setTimeout(window.stop, 0);
        }
      }, 15000);
      this.enabled = true;
      return Promise.resolve();
    }
    const playPromise = this.noSleepVideo.play();
    this.enabled = true;
    return playPromise.then(() => true).catch(() => false);
  }

  disable() {
    if (!this.enabled) {
      return;
    }
    if (nativeWakeLock()) {
      if (this._wakeLock) {
        this._wakeLock.release();
      }
      this._wakeLock = null;
    } else if (oldIOS()) {
      if (this.noSleepTimer) {
        /* console.warn(`
          NoSleep now disabled for older iOS devices.
        `);*/
        window.clearInterval(this.noSleepTimer);
        this.noSleepTimer = null;
      }
    } else {
      try {
        if (this.noSleepVideo.firstChild) {
          this.noSleepVideo.removeChild(this.noSleepVideo.firstChild);
          this.noSleepVideo.load();
        }
        this.noSleepVideo.pause();
        this.noSleepVideo.src = null;
        this.noSleepVideo.remove();
      } catch (e) {
        console.log(e);
      }
    }
    this.enabled = false;
  }
}

export default WakeLock;
