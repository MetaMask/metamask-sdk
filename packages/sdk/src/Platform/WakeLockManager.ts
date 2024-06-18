// import { WakeLockSentinel } from '../types/WakeLockSentinel';
import { logger } from '../utils/logger';
import { hasNativeWakeLock } from '../utils/hasNativeWakeLockSupport';
import { isOldIOS } from '../utils/isOldIOS';
import { mp4, webm } from './Media';

export class WakeLockManager {
  public enabled = false;

  public _wakeLock?: any;

  public noSleepTimer?: number | ReturnType<typeof setInterval>;

  public noSleepVideo?: HTMLVideoElement;

  public _eventsAdded = false;

  public debug: boolean;

  constructor(debug?: boolean) {
    this.debug = debug ?? false;
  }

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
        logger(
          `[WakeLockManager: start()] video loadedmetadata`,
          this.noSleepVideo,
        );

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

  setDebug(debug: boolean) {
    logger('[WakeLockManager: setDebug()] activate debug mode');

    this.debug = debug;
  }

  async enable() {
    if (this.enabled) {
      this.disable('from_enable');
    }

    const hasWakelock = hasNativeWakeLock();
    const oldIos = isOldIOS();

    logger(
      `[WakeLockManager: enable()] hasWakelock=${hasWakelock} isOldIos=${oldIos}`,
      this.noSleepVideo,
    );

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
        logger('[WakeLockManager: enable()] failed to enable wake lock', err);
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
      this.noSleepVideo
        .play()
        .then(() => {
          logger(
            `[WakeLockManager: enable()] video started playing successfully`,
          );
        })
        .catch((err) => {
          console.warn(`[WakeLockManager: enable()] video failed to play`, err);
        });
      this.enabled = true;
      return true;
    }

    return false;
  }

  disable(_context?: string) {
    if (!this.enabled) {
      return;
    }

    logger(`[WakeLockManager: disable()] context=${_context}`);

    if (hasNativeWakeLock()) {
      if (this._wakeLock) {
        logger(`[WakeLockManager: disable()] release wake lock`);

        this._wakeLock.release();
      }
      this._wakeLock = undefined;
    } else if (isOldIOS()) {
      if (this.noSleepTimer) {
        console.warn(`
          NoSleep now disabled for older iOS devices.
        `);
        window.clearInterval(this.noSleepTimer as number);
        this.noSleepTimer = undefined;
      }
    } else {
      try {
        if (!this.noSleepVideo) {
          logger(`[WakeLockManager: disable()] noSleepVideo is undefined`);
          return;
        }

        logger(`[WakeLockManager: disable()] pause noSleepVideo`);

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
