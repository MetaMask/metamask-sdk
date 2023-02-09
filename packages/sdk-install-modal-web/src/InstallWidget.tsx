import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import Logo from './components/Logo';
import LockIcon from './components/LockIcon';
import WalletIcon from './components/WalletIcon';
import HeartIcon from './components/HeartIcon';
import AdvantagesListItem from './components/AdvantagesListItem';
import QRCodeStyling from 'qr-code-styling';
import styles from './styles';
import CloseButton from './components/CloseButton';
import InstallIcon from './components/InstallIcon';
import resetStyles from './helpers/Reset';
import styled from '@emotion/styled';

export type InstallWidgetProps = {
  parentElement?: Element;
  link: string;
  metaMaskInstaller: {
    startDesktopOnboarding: () => void
  };
  onClose: () => void;
};

const WidgetWrapper = styled.div`
  ${resetStyles}
  font-family: Roboto,sans-serif;
`;

const InstallWidget = (props: InstallWidgetProps) => {
  const [tab, setTab] = useState<Number>(1);
  const qrCodeContainer = useRef(null);

  const setTabAcive = (tab: Number) => {
    setTab(tab);
  };

  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: 270,
      height: 270,
      type: 'svg',
      data: props.link,
      image: `data:image/png;base64,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`,

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
  }, []);

  const installExtension = () => {
    props.metaMaskInstaller.startDesktopOnboarding();
  };

  return (
    <WidgetWrapper>
      {/* @ts-ignore*/}
      <div>
        <div style={styles.backdrop} onClick={props.onClose} />
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
                  onClick={() => setTabAcive(1)}
                  style={{
                    ...styles.tab,
                    ...(tab === 1 ? styles.tabactive : {}),
                    ...styles.flexItem,
                  }}
                >
                  Desktop
                </div>
                <div
                  onClick={() => setTabAcive(2)}
                  style={{
                    ...styles.tab,
                    ...(tab === 2 ? styles.tabactive : {}),
                    ...styles.flexItem,
                  }}
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
      Puts1 you in control of your digital interactions by making power
            of cryptography more accessible`}
                />
              </div>

              <button style={styles.button} onClick={installExtension}>
                <InstallIcon />
                <span style={styles.installExtensionText}>
                  Install MetaMask Extension
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default InstallWidget;
