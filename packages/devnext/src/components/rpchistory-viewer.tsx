import { useSDK } from '@metamask/sdk-react';
import React, { CSSProperties } from 'react';
import { HistoryItem } from './history-item';

export interface RPCHistoryViewerProps {
  startVisible?: boolean;
}

export default function RPCHistoryViewer({
  startVisible,
}: RPCHistoryViewerProps) {
  const { rpcHistory } = useSDK();
  const [visible, setVisible] = React.useState(startVisible ?? false);

  // Function to convert and sort rpcHistory
  const sortedRpcHistory = React.useMemo(() => {
    const historyArray = Object.values(rpcHistory ?? {});
    return historyArray.sort((a, b) => b.timestamp - a.timestamp);
  }, [rpcHistory]);

  // Define the main container style
  const containerStyle: CSSProperties = {
    border: '1px solid #ccc',
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#f2f2f2',
    transition: 'all 0.3s',
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
  const historyViewStyle: CSSProperties = {
    overflow: 'auto',
    padding: '5px',
    backgroundColor: 'white',
    maxHeight: 300,
    border: '1px solid #eaeaea',
    transform: visible ? 'translateY(0)' : 'translateY(100%)', // Moves in and out
    transition: 'transform 0.3s', // Animate only the transform property
  };

  // Define style for the list
  const listStyle: CSSProperties = {
    listStyleType: 'none',
    padding: 0,
  };

  // Define style for individual list items
  const listItemStyle: CSSProperties = {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    marginBottom: '5px',
    padding: '10px',
    borderRadius: '4px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>RPCHistoryViewer [{sortedRpcHistory.length}]</span>
        <button onClick={() => setVisible(!visible)} style={buttonStyle}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={'history-view'} style={historyViewStyle}>
        {visible && (
          <ul style={listStyle}>
            {sortedRpcHistory.map((entry, index) => (
              <li key={index} style={listItemStyle}>
                <HistoryItem entry={entry} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
