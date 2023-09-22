import React from 'react';
import CloseButton from './components/CloseButton';
import Logo from './components/Logo';
import styles from './styles';
import { WidgetWrapper } from './WidgetWrapper';

export interface PendingModalProps {
  onClose: () => void;
  onDisconnect?: () => void;
  updateOTPValue: (otpValue: string) => void;
  displayOTP?: boolean;
}

export const PendingModal = (props: PendingModalProps) => {
  const displayOTP = props.displayOTP ?? true;

  return (
    <WidgetWrapper className="pending-modal">
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
          <div
            style={{
              ...styles.flexContainer,
              flexDirection: 'column',
              color: 'black',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                marginTop: '30px',
                marginBottom: '30px',
                ...styles.flexItem,
                fontSize: 16,
              }}
            >
              {displayOTP
                ? 'Please open the MetaMask wallet app and select the code on the screen OR disconnect'
                : 'Open the MetaMask app to continue with your session.'}
            </div>
            <div
              id="sdk-mm-otp-value"
              style={{ padding: 10, fontSize: 32, display: 'none' }}
            ></div>
            {displayOTP && (
              <div style={{ ...styles.notice }}>
                * If a number doesn't appear after opening MetaMask, please
                click disconnect and re-scan the QRCode.
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button
              style={{
                ...styles.button,
                ...styles.blue,
                marginTop: '5px',
                color: '#0376C9',
                borderColor: '#0376C9',
                borderWidth: '1px',
                borderStyle: 'solid',
                backgroundColor: 'white',
              }}
              onClick={props.onDisconnect}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};
