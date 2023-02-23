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

export type PendingWidgetProps = {
  parentElement?: Element;
  onClose: () => void;
  onDisconnect: () => void;
};

const WidgetWrapper = styled.div`
  ${resetStyles}
  font-family: Roboto,sans-serif;
`;

const PendingWidget = (props: PendingWidgetProps) => {

  return (
    <WidgetWrapper>
      {/* @ts-ignore*/}
      <div>
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
              <div style={{...styles.flexContainer, flexDirection: 'column'}}>
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '30px',
                    marginBottom: '30px',
                    ...styles.flexItem,
                    fontSize: 16,
                  }}
                >
                 Please open the MetaMask wallet app and confirm the number to re-enable the connection. Thank you!
                </div>
                <div id='sdk-mm-otp-value' style={{padding: 10, fontSize: 25, border: '1px solid', display:'none'}}>
                </div>
              </div>
              <div style={{marginTop:'20px'}}>
                <button style={{
                  ...styles.button,
                  ...styles.blue,
                  marginTop: '5px',
                  color: 'white',
                }} onClick={props.onDisconnect}>Disconnect</button>
              </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default PendingWidget;
