import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { CSSProperties } from 'react';
import { DEFAULT_SERVER_URL, useSDKConfig } from '../providers/sdkconfig-context';
import ItemView from './ItemView';
import { useQRCode } from 'next-qrcode';

export interface SDKConfigProps {
  startVisible?: boolean;
  onHomePress?: () => void;
}

export default function SDKConfig({
  startVisible,
  onHomePress,
}: SDKConfigProps) {
  const {
    socketServer,
    useDeeplink,
    checkInstallationImmediately,
    infuraAPIKey,
    setAppContext,
  } = useSDKConfig();
  const [visible, setVisible] = React.useState(startVisible ?? false);
  const isProdServer = socketServer === DEFAULT_SERVER_URL;
  const { Canvas } = useQRCode();

  const updateSocketServer = () => {
    // TODO let user input the actual server
    const newServer = isProdServer
      ? 'https://socket.siteed.net'
      : DEFAULT_SERVER_URL;
    setAppContext({ socketServer: newServer });
  };

  const updateUseDeeplink = () => {
    setAppContext({ useDeeplink: !useDeeplink });
  };

  // Define the main container style
  const containerStyle: CSSProperties = {
    border: '1px solid #ccc',
    backgroundColor: '#f2f2f2',
  };

  // Define header style
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between', // Space out title and button
    alignItems: 'center', // Align items vertically
  };

  // Define button style
  const buttonStyle = {
    cursor: 'pointer',
    padding: '5px 10px',
    backgroundColor: '#e7e7e7', // A light grey background for the button
    border: 'none',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: '#d7d7d7', // Slightly darker on hover
    },
  };

  // History view style needs conditional transform
  const configViewStyle: CSSProperties = {
    backgroundColor: 'white',
    // maxHeight: 300,
    border: '1px solid #eaeaea',
    // transform: visible ? 'translateY(0)' : 'translateY(100%)', // Moves in and out
    // transition: 'transform 0.3s', // Animate only the transform property
  };

  const actionsContainer = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  };
  const actionButtonStyle = {
    padding: '5px 10px',
    backgroundColor: '#286090',
    borderColor: '#204d74',
    color: 'white',
  };

  const handleHomePress = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onHomePress?.();
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <a href={'#home'} onClick={handleHomePress}>
          <FontAwesomeIcon icon={faHome} />
        </a>
        <span>SDKConfig</span>
        <button onClick={() => setVisible(!visible)} style={buttonStyle}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {/* TODO configure all the components of the AppContext */}
      <div style={configViewStyle}>
        {visible && (
          <>
            <ItemView label="Socket Server" value={socketServer} />
            <ItemView label="Infura API Key" value={infuraAPIKey} />
            <ItemView
              label="Use DeepLink"
              value={JSON.stringify(useDeeplink)}
            />
            <ItemView
              label="Check Installation Immediately"
              value={JSON.stringify(checkInstallationImmediately)}
            />
            <div style={actionsContainer}>
              <button onClick={updateSocketServer} style={actionButtonStyle}>
                Use {isProdServer ? 'DEV' : 'PROD'} socket server
              </button>
              <button onClick={updateUseDeeplink} style={actionButtonStyle}>
                Toggle useDeepLink
              </button>
              <button onClick={updateUseDeeplink} style={actionButtonStyle}>
                Toggle CheckInstallationImmediately
              </button>
            </div>
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                padding: 5,
                gap: 10,
              }}
            >
              <Canvas
                text={window.location.href}
                options={{
                  errorCorrectionLevel: 'M',
                  margin: 3,
                  scale: 4,
                  width: 200,
                  color: {
                    dark: '#010599FF',
                    light: '#FFBF60FF',
                  },
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
