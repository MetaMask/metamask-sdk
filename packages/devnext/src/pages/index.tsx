import { MetaMaskButton } from '@metamask/sdk-react-ui';
import Link from 'next/link';
import { PreviewScreen } from '@metamask/sdk-ui';

export default function Home() {
  return (
    <div>
      <div style={{ height: '100vh' }}>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ padding: 20, border: '1px solid' }}>
            <Link href={'demo'}>Main demo</Link>
          </div>
          <div style={{ padding: 20, border: '1px solid' }}>
            <Link href={'uikit'}>UI Kit demo</Link>
          </div>
        </div>
        <hr />
        <div>
          {/* <MetaMaskButton connectedType="account-balance" /> */}
          {/* <MetaMaskButton connectedType="custom-text" /> */}
        </div>
        <div>
          <PreviewScreen />
        </div>
      </div>
    </div>
  );
}
