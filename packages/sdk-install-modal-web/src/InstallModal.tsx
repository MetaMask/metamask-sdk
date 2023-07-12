import React, { useEffect, useRef, useState, CSSProperties } from 'react';
import AdvantagesListItem from './components/AdvantagesListItem';
import CloseButton from './components/CloseButton';
import HeartIcon from './components/HeartIcon';
import InstallIcon from './components/InstallIcon';
import WalletIcon from './components/LockIcon';
import Logo from './components/Logo';
import LockIcon from './components/WalletIcon';
import { FOX_IMAGE } from './constants';
import styles from './styles';
import { WidgetWrapper } from './WidgetWrapper';

export interface InstallModalProps {
  onClose: () => void;
  link: string;
  metaMaskInstaller: {
    startDesktopOnboarding: () => void;
  };
}

export const InstallModal = (props: InstallModalProps) => {
  const [tab, setTab] = useState<number>(1);
  const qrCodeContainer = useRef<HTMLDivElement>(null);

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
    <WidgetWrapper className='install-model'>
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
                Desktop
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
                Mobile
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
                  Scan to connect and sign with <br />
                  <span style={styles.blue}>
                    <b>MetaMask mobile app</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: tab === 2 ? 'none' : 'block' }}>
            <div style={styles.item}>
              <AdvantagesListItem
                Icon={HeartIcon}
                text={`
      Trusted by over 30 million users to buy, store, send and swap crypto
      securely`}
              />
            </div>
            <div style={styles.item}>
              <AdvantagesListItem
                Icon={WalletIcon}
                text={`
        The leading crypto wallet & gateway to blockchain apps built
        on Ethereum Mainnet, Polygon, Optimism, and many other
        networks`}
              />
            </div>
            <div style={styles.item}>
              <AdvantagesListItem
                Icon={LockIcon}
                text={`
      Puts you in control of your digital interactions by making power
            of cryptography more accessible`}
              />
            </div>

            <button
              style={styles.button}
              onClick={props.metaMaskInstaller.startDesktopOnboarding}
            >
              <InstallIcon />
              <span style={styles.installExtensionText}>
                Install MetaMask Extension
              </span>
            </button>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};
