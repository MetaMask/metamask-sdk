/* eslint-disable react-native/no-inline-styles */
import React from 'react';

export interface ChainRPC {
  method: string;
  params: any[];
  result?: any;
}

export interface ChainRPCs {
  processing?: boolean;
  rpcs: ChainRPC[];
  error?: any;
}
export interface RPCChainViewerProps {
  chainRPCs: ChainRPCs;
}

export const RPCChainViewer = ({ chainRPCs }: RPCChainViewerProps) => {
  const { processing, rpcs, error } = chainRPCs;
  return (
    <div style={{ padding: 10, border: '1px solid' }}>
      <span>RPCChainViewer</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          return false;
        }}
        style={{ paddingLeft: 10, paddingRight: 10 }}
      >
        [ Hide ]
      </a>
      {processing && <div>Waiting for result...</div>}
      {error && (
        <div style={{ fontWeight: 'bold', color: 'red' }}>
          Error: {error.message}
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th />
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rpcs.map(({ method, params, result }, index) => {
            const rowClass = index % 2 === 0 ? 'alternate-row' : '';

            return (
              <tr key={`t${index}`} className={rowClass}>
                <td>
                  <strong>{method}</strong>
                  <pre
                    style={{
                      inlineSize: 450,
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {JSON.stringify(params, null, 2)}
                  </pre>
                </td>
                <td style={{ padding: 10 }}>
                  <div style={{ inlineSize: 450, overflowWrap: 'break-word' }}>
                    {result}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
