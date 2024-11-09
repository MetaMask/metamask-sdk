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
import styles from './styles';
import SDKVersion from './components/SDKVersion';
import encodeQR from '@paulmillr/qr';

export interface InstallModalProps {
  onClose: () => void;
  link: string;
  sdkVersion?: string;
  preferDesktop: boolean;
  metaMaskInstaller: {
    startDesktopOnboarding: () => void;
  };
  i18nInstance: i18n;
}

export const InstallModal = (props: InstallModalProps) => {
  const [tab, setTab] = useState<number>(props.preferDesktop ? 1 : 2);
  const qrCodeContainer = useRef<HTMLDivElement>(null);
  const { sdkVersion } = props;

  const t = props.i18nInstance.t;

  useEffect(() => {
    if (qrCodeContainer.current) {
      const svgElement = encodeQR(props.link, "svg", {
        ecc: "medium",
        scale: 2
      })
      qrCodeContainer.current.innerHTML = svgElement
    }
  }, [qrCodeContainer]);

  return (
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
  );
};
