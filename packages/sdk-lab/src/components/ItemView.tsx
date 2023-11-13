import React, { CSSProperties } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface ItemViewProps {
  label: string;
  value?: string;
  processing?: boolean;
  containerStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
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
    // width: '100%',
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
  contentStyle,
}: ItemViewProps) {
  return (
    <div style={{ ...styles.container, ...containerStyle }}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.content, ...contentStyle }}>
        {processing ? (
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} pulse />
          </div>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
