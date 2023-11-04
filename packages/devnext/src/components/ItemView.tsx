import React, { CSSProperties } from 'react';

export interface ItemViewProps {
  label: string;
  value?: string;
  processing?: boolean;
  containerStyle?: React.CSSProperties;
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 8,
    border: '1px solid black',
    borderRadius: 8,
    margin: 8,
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
  },
  content: {
    paddingLeft: 5,
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    maxWidth: '100%',
  },
};

export default function ItemView({
  label,
  value,
  processing,
  containerStyle,
}: ItemViewProps) {
  return (
    <div style={{ ...styles.container, ...containerStyle }}>
      <div style={styles.label}>{label}</div>
      <div style={styles.content}>{processing ? 'processing...' : value}</div>
    </div>
  );
}
