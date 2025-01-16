'use client';

import { Geist } from 'next/font/google';
import './globals.css';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { useEffect, useState } from 'react';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dappUrl, setDappUrl] = useState('');

  useEffect(() => {
    setDappUrl(window.location.href);
  }, []);

  return (
    <html lang="en">
      <body className={geist.variable}>
        <MetaMaskProvider
          debug={false}
          sdkOptions={{
            dappMetadata: {
              name: 'Simple Web3 Dapp',
              url: dappUrl,
            },
          }}
        >
          <>{children}</>
        </MetaMaskProvider>
      </body>
    </html>
  );
}
