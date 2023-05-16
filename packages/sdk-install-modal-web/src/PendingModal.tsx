import CloseButton from "./components/CloseButton";
import Logo from "./components/Logo";
import styles from "./styles";
import { WidgetWrapper } from "./WidgetWrapper";

export interface PendingModalProps {
  onClose: () => void;
  onDisconnect?: () => void;
  updateOTPValue: (otpValue: string) => void;
}

export const PendingModal = (props: PendingModalProps) => {
  return <WidgetWrapper>
    <div style={styles.backdrop} onClick={props.onClose}>
      </div>
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
                Please open the MetaMask wallet app and select the code on the
                screen OR disconnect
              </div>
              <div
                id="sdk-mm-otp-value"
                style={{ padding: 10, fontSize: 32, display: 'none' }}
              ></div>
              <div style={{...styles.notice}}>
                * If a number doesn't appear after opening MetaMask, please click disconnect and re-scan the QRCode.
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                style={{
                  ...styles.button,
                  ...styles.blue,
                  marginTop: '5px',
                  color: 'white',
                }}
                onClick={props.onDisconnect}
              >
                Disconnect
              </button>
            </div>
      </div>
    </div>
  </WidgetWrapper>;
};
