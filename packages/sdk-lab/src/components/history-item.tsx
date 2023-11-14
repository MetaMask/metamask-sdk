import { RPCMethodResult } from '@metamask/sdk-communication-layer';
import React, { CSSProperties } from 'react';

interface HistoryItemProps {
  entry: RPCMethodResult;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ entry }) => {
  const contentStyle: CSSProperties = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <div>
        <strong>Method:</strong> {entry.method}
      </div>
      <div style={contentStyle}>
        <strong>Result:</strong>
        {JSON.stringify(entry.result, null, 2)}
      </div>
      <div style={contentStyle}>
        <strong>Error:</strong>
        {JSON.stringify(entry.error, null, 2)}
      </div>
      <div>
        <strong>Elapsed Time:</strong>{' '}
        {entry.elapsedTime ? `${entry.elapsedTime} ms` : 'N/A'}
      </div>
      <div>
        <strong>Timestamp:</strong> {new Date(entry.timestamp).toLocaleString()}
      </div>
    </div>
  );
};
