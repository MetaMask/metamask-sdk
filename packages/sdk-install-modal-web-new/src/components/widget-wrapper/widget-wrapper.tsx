import { h } from '@stencil/core';
import './resetStyles.css';

const widgetWrapperStyle = {
  fontFamily: 'Roboto, sans-serif',
};

export const WidgetWrapper = ({
  className,
}: {
  className: string;
}, children) => {
  return (
    <div style={widgetWrapperStyle} class={className}>
      {children}
    </div>
  );
};