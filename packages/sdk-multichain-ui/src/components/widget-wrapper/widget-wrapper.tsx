import { h, ChildNode } from '@stencil/core';
import './resetStyles.css';

const widgetWrapperStyle = {
  fontFamily: 'Roboto, sans-serif',
};

export const WidgetWrapper = ({
  className,
}: {
  className: string;
}, children: ChildNode) => {
  return (
    <div style={widgetWrapperStyle} class={className}>
      {children}
    </div>
  );
};