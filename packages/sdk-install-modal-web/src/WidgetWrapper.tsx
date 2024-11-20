import React from 'react';
import './resetStyles.css';

const widgetWrapperStyle = {
  fontFamily: 'Roboto, sans-serif',
};

export const WidgetWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return (
    <div style={widgetWrapperStyle} className={className}>
      {children}
    </div>
  );
};
