export interface OTPModalProps {
  onClose: () => void;
  onDisconnect?: () => void;
  sdkVersion?: string;
  updateOTPValue: (otpValue: string) => void;
  displayOTP?: boolean;
}

export const OtpModal = (props: OTPModalProps) => {
  const displayOTP = props.displayOTP ?? true;

  return (
    <>
      <div style={styles.backdrop} onClick={props.onClose}></div>
      <div style={styles.modal}>
        <div style={styles.closeButtonContainer}>
          <div style={styles.right}>
            <span style={styles.closeButton} onClick={props.onClose}>
              Close
            </span>
          </div>
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
    </>
  );
};

const styles = {
  flexContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  flexItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notice: {
    fontSize: 12,
    margin: 10,
    color: '#606060', // Subtle color for notes
  },
  button: {
    marginTop: '30px', // Adjusted for minimal spacing
    padding: '12px 20px',
    background: '#E0E0E0', // Neutral color
    borderRadius: '4px', // Less rounded corners for a minimal look
    color: '#303030', // Darker text for contrast
    border: 'none', // Removing border
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%', // Full width for simplicity
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    color: '#909090', // Neutral color for the close button
    cursor: 'pointer',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', // Aligning to the right
  },
  flexItem11: {
    flex: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexItem1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    padding: 8,
    cursor: 'pointer',
    backgroundColor: '#F2F4F6',
    fontSize: 12,
    textAlign: 'center',
    color: '#24292E',
  },
  tabcontainer: {
    padding: '4px',
    backgroundColor: '#F2F4F6',
    borderRadius: '8px',
    marginBottom: 30,
    marginTop: 30,
  },
  tabactive: {
    backgroundColor: 'white',
    WebkitTransition: 'background-color 300ms linear',
    msTransition: 'background-color 300ms linear',
    transition: 'background-color 300ms linear',
    borderRadius: '8px',
  },
  item: {
    fontSize: '12px',
    marginBottom: 16,
    borderRadius: '8px',
    padding: '10px',
    border: '2px #F2F4F6 solid',
    color: '#24292E',
  },
  extensionLabel: {
    fontsStyle: 'normal',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center' as 'center',
    color: '#24272A',
  },

  backdrop: {
    visibility: 'visible' as 'visible',
    position: 'fixed' as 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    width: '100%',
    zIndex: 99998,
    background: 'rgba(0, 0, 0, 0.87)',
    opacity: 0.3,
  },
  modal: {
    visibility: 'visible' as 'visible',
    position: 'fixed' as 'fixed',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 99999,
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    top: '50%',
    maxWidth: '100%',
    width: 460,
    minWidth: 300,
    boxShadow:
      'rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px',
    WebkitFontSmoothing: 'antialiased',
  },
  closeButtonContainer: {},
  logoContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectMobileText: {
    fontSize: 14,
    color: 'black',
    marginTop: 28,
    marginBottom: 28,
    lineHeight: 2,
  },
  blue: {
    color: '#037DD6',
    fontWeight: 700,
  },
  installExtensionText: {
    marginLeft: 10,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
