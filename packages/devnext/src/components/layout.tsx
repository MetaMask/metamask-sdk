import { SDKConfig } from '@metamask/sdk-lab';
import { FloatingMetaMaskButton } from '@metamask/sdk-ui';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

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
      <FloatingMetaMaskButton distance={{ bottom: 40 }} />
    </div>
  );
};
