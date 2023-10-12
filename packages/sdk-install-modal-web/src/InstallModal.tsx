import { i18n } from 'i18next';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import AdvantagesListItem from './components/AdvantagesListItem';
import CloseButton from './components/CloseButton';
import HeartIcon from './components/HeartIcon';
import InstallIcon from './components/InstallIcon';
import WalletIcon from './components/LockIcon';
import Logo from './components/Logo';
import LockIcon from './components/WalletIcon';
import { FOX_IMAGE } from './constants';
import TranslationWrapper from './providers/TranslationWrapper';
import styles from './styles';
import SDKVersion from './components/SDKVersion';

export interface InstallModalProps {
  onClose: () => void;
  link: string;
  sdkVersion?: string;
  metaMaskInstaller: {
    startDesktopOnboarding: () => void;
  };
  i18nInstance: i18n;
}

export const InstallModal = (props: InstallModalProps) => {
  const [tab, setTab] = useState<number>(2);
  const qrCodeContainer = useRef<HTMLDivElement>(null);
  const { sdkVersion } = props;

  const t = props.i18nInstance.t;

  useEffect(() => {
    if (qrCodeContainer.current) {
      // Prevent nextjs import issue: https://github.com/kozakdenys/qr-code-styling/issues/38
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCodeStyling = require('qr-code-styling');
      const qrCode = new QRCodeStyling({
        width: 270,
        height: 270,
        type: 'svg',
        data: props.link,
        image: FOX_IMAGE,
        dotsOptions: {
          color: 'black',
          type: 'rounded',
        },
        imageOptions: {
          margin: 5,
        },
        cornersDotOptions: {
          color: '#f66a07',
        },
        qrOptions: {
          errorCorrectionLevel: 'M',
        },
      });
      qrCode.append(qrCodeContainer.current);
    }
  }, [qrCodeContainer]);

  return (
    <TranslationWrapper i18nInstance={props.i18nInstance}>
      <WidgetWrapper className="install-model">
        <div style={styles.backdrop} onClick={props.onClose}></div>
        <div style={styles.modal}>
          <div style={styles.closeButtonContainer}>
            <div style={styles.right}>
              <span style={styles.closeButton} onClick={props.onClose}>
                <CloseButton />
              </span>
            </div>
          </div>
          <div style={styles.logoContainer}>
            <Logo />
          </div>
          <div>
            <div style={styles.tabcontainer}>
              <div style={styles.flexContainer}>
                <div
                  onClick={() => setTab(1)}
                  style={
                    {
                      ...styles.tab,
                      ...(tab === 1 ? styles.tabactive : {}),
                      ...styles.flexItem,
                    } as CSSProperties
                  }
                >
                  {t('DESKTOP')}
                </div>
                <div
                  onClick={() => setTab(2)}
                  style={
                    {
                      ...styles.tab,
                      ...(tab === 2 ? styles.tabactive : {}),
                      ...styles.flexItem,
                    } as CSSProperties
                  }
                >
                  {t('MOBILE')}
                </div>
              </div>
            </div>
            <div style={{ display: tab === 1 ? 'none' : 'block' }}>
              <div style={styles.flexContainer}>
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 4,
                    ...styles.flexItem,
                  }}
                >
                  <div ref={qrCodeContainer} style={styles.center} />
                  <div style={styles.connectMobileText}>
                    {t('SCAN_TO_CONNECT')} <br />
                    <span style={styles.blue}>
                      <b>{t('META_MASK_MOBILE_APP')}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: tab === 2 ? 'none' : 'block' }}>
              <div style={styles.item}>
                <AdvantagesListItem
                  Icon={HeartIcon}
                  text={t('INSTALL_MODAL.TRUSTED_BY_USERS')}
                />
              </div>
              <div style={styles.item}>
                <AdvantagesListItem
                  Icon={WalletIcon}
                  text={t('INSTALL_MODAL.LEADING_CRYPTO_WALLET')}
                />
              </div>
              <div style={styles.item}>
                <AdvantagesListItem
                  Icon={LockIcon}
                  text={t('INSTALL_MODAL.CONTROL_DIGITAL_INTERACTIONS')}
                />
              </div>

              <button
                style={styles.button}
                onClick={props.metaMaskInstaller.startDesktopOnboarding}
              >
                <InstallIcon />
                <span style={styles.installExtensionText}>
                  {t('INSTALL_MODAL.INSTALL_META_MASK_EXTENSION')}
                </span>
              </button>
            </div>
          </div>
          <SDKVersion version={sdkVersion} />
        </div>
      </WidgetWrapper>
    </TranslationWrapper>
  );
};
