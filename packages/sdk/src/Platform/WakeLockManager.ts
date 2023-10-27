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
    console.debug(
      `WakeLockManager::start() hasNativeWakeLock=${hasNativeWakeLock()}`,
    );

    if (hasNativeWakeLock() && !this._eventsAdded) {
      this._eventsAdded = true;
      this._wakeLock = undefined;
      const handleVisibilityChange = async () => {
        console.log(
          `WakeLockManager::handleVisibilityChange() visibility=${document.visibilityState}`,
        );

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
      this.noSleepVideo.setAttribute('controls', '');
      this.noSleepVideo.setAttribute('loop', '');
      this.noSleepVideo.setAttribute('autoPlay', '');
      this.noSleepVideo.setAttribute('mute', '');

      this._addSourceToVideo(this.noSleepVideo, 'webm', webm);
      this._addSourceToVideo(this.noSleepVideo, 'mp4', mp4);

      this.noSleepVideo.addEventListener('loadedmetadata', () => {
        console.log(
          `noSleepvideo loaded... duration=${this.noSleepVideo?.duration}`,
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

      console.log(`Append no sleepVideo to body`);
      document.body.appendChild(this.noSleepVideo);
    }
  }

  _addSourceToVideo(element: HTMLVideoElement, type: string, dataURI: string) {
    const source = document.createElement('source');
    source.src = dataURI;
    source.type = `video/${type}`;
    console.debug(`WakeLockManager::_addSourceToVideo()`, source);
    element.appendChild(source);
  }

  isEnabled() {
    return this.enabled;
  }

  // TODO convert to async function
  async enable() {
    console.log(`WakeLockManager::enable() enabled=${this.enabled}`);
    if (this.enabled) {
      console.warn(`WakeLockManager::enable() already enabled`);
      this.disable('from_enable');
    }

    this.start();
    if (hasNativeWakeLock()) {
      console.debug(`WakeLockManager::enable() hasNativeWakeLock=true`);

      try {
        const wakeLock = await navigator.wakeLock.request('screen');
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
        console.warn(`WakeLockManager::enable() failed`, err);
        this.enabled = false;
        return false;
      }
    } else if (isOldIOS()) {
      console.warn(`WakeLockManager::enable() isOldIOS=true`);
      this.disable('from_enable_old_ios');
      /* console.warn(`
        NoSleep enabled for older iOS devices. This can interrupt
        active or long-running network requests from completing successfully.
        See https://github.com/richtr/NoSleep.js/issues/15 for more details.
      `);*/
      this.noSleepTimer = window.setInterval(() => {
        console.log(
          `WakeLockManager::enable() noSleepTimer fired document.hidden=${document.hidden}`,
        );

        if (!document.hidden) {
          window.location.href = window.location.href.split('#')[0];
          window.setTimeout(window.stop, 0);
        }
      }, 15000);
      this.enabled = true;
      return true;
    }

    console.debug(
      `WakeLockManager::enable() hasNativeWakeLock=false`,
      this.noSleepVideo,
    );

    if (this.noSleepVideo) {
      try {
        console.log(`WakeLockManager::enable() video should start playing...`);
        this.noSleepVideo?.play().catch((err) => {
          console.warn(`WakeLockManager::enable() video failed to play`, err);
        });
        this.enabled = true;
        return true;
      } catch (err) {
        console.log(
          `WakeLockManager::enable() video failed to start playing`,
          err,
        );
        this.enabled = false;
        return false;
      }
    }

    console.warn(`WakeLockManager::enable() failed`);
    return false;
  }

  disable(context?: string) {
    console.log(
      `WakeLockManager::disable() context=${context} this.enabled=${this.enabled}`,
    );

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
