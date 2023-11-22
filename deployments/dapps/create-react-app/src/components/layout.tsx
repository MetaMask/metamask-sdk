import React, { ReactNode } from 'react';
import SDKConfig from './sdk-config';
export interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <SDKConfig
        onHomePress={() => {
          window.location.href = '/';
        }}
      />
      {children}
    </div>
  );
};
