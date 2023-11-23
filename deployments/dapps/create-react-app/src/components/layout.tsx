import React, { ReactNode } from 'react';
import { SDKConfigCard } from '@metamask/sdk-ui';

export interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <SDKConfigCard
        onHomePress={() => {
          window.location.href = '/';
        }}
      />
      {children}
    </div>
  );
};
