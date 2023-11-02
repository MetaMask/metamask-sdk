// import { WakeLockSentinel } from '../types/WakeLockSentinel';
import { hasNativeWakeLock } from '../utils/hasNativeWakeLockSupport';
import { isOldIOS } from '../utils/isOldIOS';
import { mp4, webm } from './Media';

export class WakeLockManager {
  private enabled = false;

  private _wakeLock?: any;

  private noSleepTimer?: number | ReturnType<typeof setInterval>;

  private noSleepVideo?: HTMLVideoElement;

  private _eventsAdded = false;

  start() {
    this.enabled = false;

    if (hasNativeWakeLock() && !this._eventsAdded) {
      this._eventsAdded = true;
      this._wakeLock = undefined;
      const handleVisibilityChange = async () => {
        if (this._wakeLock !== null && document.visibilityState === 'visible') {
          await this.enable();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleVisibilityChange);
    } else if (isOldIOS()) {
      this.noSleepTimer = undefined;
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
        if (!this.noSleepVideo) {
          return;
        }

        if (this.noSleepVideo.duration <= 1) {
          // webm source
          this.noSleepVideo.setAttribute('loop', '');
        } else {
          // mp4 source
          this.noSleepVideo.addEventListener('timeupdate', () => {
            if (!this.noSleepVideo) {
              return;
            }

            if (this.noSleepVideo.currentTime > 0.5) {
              this.noSleepVideo.currentTime = Math.random();
            }
          });
        }
      });
    }
  }

  _addSourceToVideo(element: HTMLVideoElement, type: string, dataURI: string) {
    const source = document.createElement('source');
    source.src = dataURI;
    source.type = `video/${type}`;
    element.appendChild(source);
  }

  isEnabled() {
    return this.enabled;
  }

  async enable() {
    if (this.enabled) {
      this.disable('from_enable');
    }

    this.start();
    if (hasNativeWakeLock()) {
      try {
        const wakeLock = await (navigator as any).wakeLock.request('screen');

        this._wakeLock = wakeLock;
        this.enabled = true;
        // console.log('Wake Lock active.');
        /* this._wakeLock.addEventListener('release', () => {
            // ToDo: Potentially emit an event for the page to observe since
            // Wake Lock releases happen when page visibility changes.
            // (https://web.dev/wakelock/#wake-lock-lifecycle)
            console.log('Wake Lock released.');
          });*/
      } catch (err) {
        this.enabled = false;
        return false;
      }
    } else if (isOldIOS()) {
      this.disable('from_enable_old_ios');
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
      return true;
    }

    if (this.noSleepVideo) {
      try {
        this.noSleepVideo?.play().catch((err) => {
          console.warn(`WakeLockManager::enable() video failed to play`, err);
        });
        this.enabled = true;
        return true;
      } catch (err) {
        console.warn(
          `WakeLockManager::enable() video failed to start playing`,
          err,
        );
        this.enabled = false;
        return false;
      }
    }

    return false;
  }

  disable(_context?: string) {
    if (!this.enabled) {
      return;
    }

    if (hasNativeWakeLock()) {
      if (this._wakeLock) {
        this._wakeLock.release();
      }
      this._wakeLock = undefined;
    } else if (isOldIOS()) {
      if (this.noSleepTimer) {
        /* console.warn(`
          NoSleep now disabled for older iOS devices.
        `);*/
        window.clearInterval(this.noSleepTimer as number);
        this.noSleepTimer = undefined;
      }
    } else {
      try {
        if (!this.noSleepVideo) {
          return;
        }

        if (this.noSleepVideo.firstChild) {
          this.noSleepVideo.removeChild(this.noSleepVideo.firstChild);
          this.noSleepVideo.load();
        }
        this.noSleepVideo.pause();
        this.noSleepVideo.src = '';
        this.noSleepVideo.remove();
      } catch (e) {
        console.log(e);
      }
    }
    this.enabled = false;
  }
}
