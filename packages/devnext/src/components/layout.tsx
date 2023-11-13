import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { SDKConfig } from '@metamask/sdk-lab';

export interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();

  return (
    <div>
      <SDKConfig
        onHomePress={() => {
          router.push('/');
        }}
      />
      {children}
    </div>
  );
};
