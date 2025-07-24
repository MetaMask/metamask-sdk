import { h, ChildNode } from '@stencil/core';
import './resetStyles.css';

const widgetWrapperStyle = {
  fontFamily: '"Euclid Circular B", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
