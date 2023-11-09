import React, { ReactNode } from 'react';
import SDKConfig from './sdk-config';
import { useRouter } from 'next/router';

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
