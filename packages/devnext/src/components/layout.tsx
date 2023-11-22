import { FloatingMetaMaskButton, SDKConfigCard } from '@metamask/sdk-ui';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();

  return (
    <div>
      <SDKConfigCard
        options={{ showQRCode: true }}
        onHomePress={() => {
          router.push('/');
        }}
      />
      {children}
      <FloatingMetaMaskButton distance={{ bottom: 40 }} />
    </div>
  );
};
